import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { business, unsetBusinessFields } from '../../config/business';
import { renderRoute } from '../../test/render';
import { AboutPage, ContactPage, PrivacyPage, RefundsPage, ShippingPage, TermsPage } from './pages';

describe('pages Razorpay requires', () => {
  it.each([
    ['About us', AboutPage],
    ['Contact us', ContactPage],
    ['Terms & conditions', TermsPage],
    ['Privacy policy', PrivacyPage],
    ['Refunds & cancellations', RefundsPage],
    ['Shipping & delivery', ShippingPage],
  ])('%s renders with its heading and who operates the site', (title, Page) => {
    renderRoute(<Page />);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText(business.legalName)).toBeInTheDocument();
  });

  it('the contact page lists how to reach the business', () => {
    renderRoute(<ContactPage />);
    expect(screen.getByText(/Registered office:/)).toBeInTheDocument();
    expect(screen.getAllByText(business.supportEmail).length).toBeGreaterThan(0);
    expect(screen.getByText(/Phone:/)).toBeInTheDocument();
  });

  it('the refund policy says when refunds arrive', () => {
    renderRoute(<RefundsPage />);
    expect(screen.getByText(new RegExp(business.refundDays))).toBeInTheDocument();
  });
});

describe('business details', () => {
  it('lists the fields still holding placeholder text', () => {
    expect(unsetBusinessFields({ legalName: '[x]', address: 'MG Road', phone: '[+91]' })).toEqual([
      'legalName',
      'phone',
    ]);
    expect(unsetBusinessFields({ legalName: 'Acme Foods Pvt Ltd', cities: ['Pune'] })).toEqual([]);
  });
});
