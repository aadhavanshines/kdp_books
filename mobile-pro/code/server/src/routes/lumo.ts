import { Hono } from 'hono';
import { z } from 'zod';
import { ART_NAMES, ART_TONES, PHOTO_FILTERS } from '@pro/api/types';

import type { Deps } from '../deps';
import { currentUser, requireAuth, type AppEnv } from '../lib/auth';
import { notFound } from '../lib/errors';
import { parseJson } from '../lib/json';
import { validate } from '../lib/validate';
import * as lumo from '../services/lumo';

const sceneSchema = z.object({
  tone: z.enum(ART_TONES),
  layers: z
    .array(
      z.object({
        art: z.enum(ART_NAMES),
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
        size: z.number().min(0.02).max(1.5),
        rotate: z.number().min(-360).max(360).optional(),
        flip: z.boolean().optional(),
        opacity: z.number().min(0).max(1).optional(),
      }),
    )
    .min(1)
    .max(8),
});

const pageQuery = z.object({ cursor: z.string().optional(), limit: z.coerce.number().int().min(1).max(30).default(10) });
const textBody = z.object({ text: z.string().trim().min(1).max(1000) });

export function lumoRoutes(deps: Deps) {
  const app = new Hono<AppEnv>();
  const { db } = deps;
  app.use('*', requireAuth(deps.config.jwtSecret));
  const me = (c: Parameters<typeof currentUser>[0]) => currentUser(c);

  app.get('/feed', validate('query', pageQuery), (c) => {
    const q = c.req.valid('query');
    return c.json(lumo.feed(db, me(c), q.cursor, q.limit));
  });
  app.get('/explore', validate('query', pageQuery), (c) => {
    const q = c.req.valid('query');
    return c.json(lumo.explore(db, me(c), q.cursor, q.limit));
  });

  app.get('/stories', (c) => c.json(lumo.storyGroups(db, me(c), deps.clock())));
  app.post('/stories/:id/seen', (c) => {
    lumo.markStorySeen(db, me(c), c.req.param('id'));
    return c.body(null, 204);
  });
  app.get('/highlights/:id/stories', (c) => {
    const row = db.prepare('SELECT story_ids_json FROM highlights WHERE id = ?').get(c.req.param('id')) as { story_ids_json: string } | undefined;
    if (!row) throw notFound('Highlight');
    return c.json(lumo.getStories(db, parseJson<string[]>(row.story_ids_json, [])));
  });

  app.post(
    '/posts',
    validate(
      'json',
      z.object({
        scene: sceneSchema,
        filter: z.enum(PHOTO_FILTERS).default('normal'),
        caption: z.string().max(2200).default(''),
        location: z.string().trim().max(80).nullable().optional(),
        taggedUserIds: z.array(z.string()).max(20).optional(),
      }),
    ),
    (c) => c.json(lumo.createPost(db, me(c), c.req.valid('json'), deps.clock()), 201),
  );
  app.get('/posts/:id', (c) => c.json(lumo.getPost(db, me(c), c.req.param('id'))));
  app.delete('/posts/:id', (c) => {
    lumo.deletePost(db, me(c), c.req.param('id'));
    return c.body(null, 204);
  });
  app.put('/posts/:id/like', (c) => c.json(lumo.setLike(db, me(c), c.req.param('id'), true, deps.clock())));
  app.delete('/posts/:id/like', (c) => c.json(lumo.setLike(db, me(c), c.req.param('id'), false, deps.clock())));
  app.put('/posts/:id/save', (c) => c.json(lumo.setSaved(db, me(c), c.req.param('id'), true, deps.clock())));
  app.delete('/posts/:id/save', (c) => c.json(lumo.setSaved(db, me(c), c.req.param('id'), false, deps.clock())));
  app.get('/posts/:id/comments', (c) => c.json(lumo.listComments(db, me(c), c.req.param('id'))));
  app.post('/posts/:id/comments', validate('json', textBody), (c) =>
    c.json(lumo.addComment(db, me(c), c.req.param('id'), c.req.valid('json').text, deps.clock()), 201),
  );
  app.put('/comments/:id/like', (c) => c.json(lumo.setCommentLike(db, me(c), c.req.param('id'), true)));
  app.delete('/comments/:id/like', (c) => c.json(lumo.setCommentLike(db, me(c), c.req.param('id'), false)));

  app.get('/users/:handle', (c) => c.json(lumo.profile(db, me(c), c.req.param('handle'))));
  app.get('/users/:handle/posts', validate('query', z.object({ tab: z.enum(['grid', 'tagged', 'saved']).default('grid') })), (c) =>
    c.json(lumo.profilePosts(db, me(c), c.req.param('handle'), c.req.valid('query').tab)),
  );
  app.put('/users/:id/follow', (c) => c.json(lumo.setFollow(db, me(c), c.req.param('id'), true, deps.clock())));
  app.delete('/users/:id/follow', (c) => c.json(lumo.setFollow(db, me(c), c.req.param('id'), false, deps.clock())));
  app.get('/search/users', validate('query', z.object({ q: z.string().default('') })), (c) =>
    c.json(lumo.searchUsers(db, me(c), c.req.valid('query').q)),
  );
  app.get('/suggestions', (c) => c.json(lumo.suggestedUsers(db, me(c))));

  app.get('/notifications', (c) => c.json(lumo.notifications(db, me(c))));
  app.post('/notifications/read', (c) => {
    lumo.markNotificationsRead(db, me(c));
    return c.body(null, 204);
  });

  app.get('/conversations', (c) => c.json(lumo.listConversations(db, me(c))));
  app.post('/conversations', validate('json', z.object({ userIds: z.array(z.string()).min(1).max(10) })), (c) =>
    c.json(lumo.startConversation(db, me(c), c.req.valid('json').userIds, deps.clock()), 201),
  );
  app.get('/conversations/:id', (c) => c.json(lumo.getConversation(db, me(c), c.req.param('id'))));
  app.get('/conversations/:id/messages', (c) => c.json(lumo.listMessages(db, me(c), c.req.param('id'), deps.clock())));
  app.post('/conversations/:id/messages', validate('json', textBody), (c) =>
    c.json(lumo.sendMessage(db, me(c), c.req.param('id'), c.req.valid('json').text, deps.clock()), 201),
  );
  return app;
}
