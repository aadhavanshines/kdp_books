import { Link } from 'react-router';
import { Logo } from '../../components/Logo';

const columns = [
  {
    title: 'Company',
    links: [
      ['About us', '/about'],
      ['Contact us', '/contact'],
    ],
  },
  {
    title: 'For you',
    links: [
      ['Offers', '/offers'],
      ['Help & support', '/help'],
      ['Your orders', '/orders'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['Terms & conditions', '/terms'],
      ['Privacy policy', '/privacy'],
      ['Refunds & cancellations', '/refunds'],
      ['Shipping & delivery', '/shipping'],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-sunken">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Food from the best restaurants near you, delivered fast. Built as a production-quality
            reference app.
          </p>
          <p className="mt-6 text-xs text-muted">
            © {new Date().getFullYear()} QuickBite. All prices in ₹ include applicable taxes at
            checkout.
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-extrabold">{col.title}</h2>
            <ul className="mt-3 space-y-2.5">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
