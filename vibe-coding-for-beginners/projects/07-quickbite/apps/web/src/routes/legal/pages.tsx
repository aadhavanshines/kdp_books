import { Link } from 'react-router';
import { business as b } from '../../config/business';
import { LegalPage, Operator } from './LegalPage';

const email = <a href={`mailto:${b.supportEmail}`}>{b.supportEmail}</a>;
const cities = b.serviceCities.join(', ');

export const AboutPage = () => (
  <LegalPage title="About us" summary={`Who we are and what ${b.tradeName} does.`}>
    <Operator />
    <p>
      {b.tradeName} is an online food ordering and delivery service. You choose a restaurant near
      you, pick your dishes, pay online and follow the order until it reaches your door. We list
      restaurants and their menus, take your order and payment, and arrange delivery.
    </p>
    <p>We currently deliver in {cities}.</p>
    <h2>How an order works</h2>
    <ul>
      <li>Prices, taxes and delivery charges are worked out by us and shown before you pay.</li>
      <li>
        Payment is taken by Razorpay, a licensed payment gateway. We never see or store your card,
        UPI or bank details.
      </li>
      <li>The restaurant prepares your food and it is delivered to the address you chose.</li>
    </ul>
    <p>
      Questions? See <Link to="/contact">Contact us</Link>.
    </p>
  </LegalPage>
);

export const ContactPage = () => (
  <LegalPage title="Contact us" summary="Reach us about an order, a payment or anything else.">
    <Operator />
    <ul>
      <li>Email: {email}</li>
      <li>Phone: {b.supportPhone}</li>
      <li>Hours: {b.supportHours}</li>
      <li>Registered office: {b.address}</li>
    </ul>
    <p>
      For an order, please include the order number (shown on the order page) and the email you
      signed in with, so we can find it quickly. We reply within 2 working days.
    </p>
    <h2>Grievance officer</h2>
    <p>
      If we have not resolved a complaint, write to our grievance officer, {b.grievanceOfficer}, at{' '}
      {email}. We acknowledge complaints within 48 hours and aim to resolve them within one month.
    </p>
  </LegalPage>
);

export const TermsPage = () => (
  <LegalPage
    title="Terms & conditions"
    summary={`The rules for using ${b.tradeName}. By placing an order you agree to them.`}
  >
    <Operator />
    <h2>Using the service</h2>
    <ul>
      <li>You must be 18 or older, or use the service with a parent or guardian’s permission.</li>
      <li>Give correct delivery details and a phone number we can reach on delivery.</li>
      <li>Do not misuse the service: no fake orders, abuse of coupons or attempts to break it.</li>
    </ul>
    <h2>Menus, prices and availability</h2>
    <p>
      Menus and prices are provided by restaurants and can change. The price you see in your bill
      when you place the order is the price you pay. A dish may become unavailable after you add it
      to the cart; we tell you before you pay and you can change the order.
    </p>
    <h2>Your bill</h2>
    <p>
      The bill shows the item total, any coupon discount, delivery fee, platform fee and taxes (GST)
      in Indian rupees. Amounts are calculated on our servers when you place the order.
    </p>
    <h2>Payments</h2>
    <p>
      Orders are paid online through Razorpay (cards, UPI, netbanking and wallets). An order is
      confirmed only when the payment succeeds. If money is deducted but the order is not confirmed,
      it is returned as described in our <Link to="/refunds">refund policy</Link>.
    </p>
    <h2>Cancellations and refunds</h2>
    <p>
      See <Link to="/refunds">Refunds &amp; cancellations</Link>. Delivery times and areas are in
      the <Link to="/shipping">delivery policy</Link>.
    </p>
    <h2>Coupons</h2>
    <p>
      Coupons have their own conditions (minimum order, limit per customer, validity) shown with the
      coupon. We may withdraw a coupon that is misused.
    </p>
    <h2>Allergies and food information</h2>
    <p>
      Restaurants prepare the food. If you have an allergy, contact the restaurant before ordering;
      we cannot guarantee that a dish is free of any ingredient.
    </p>
    <h2>Our responsibility</h2>
    <p>
      We take care to keep the service accurate and available but it is provided as is. To the
      extent the law allows, our liability for an order is limited to the amount you paid for it.
      Nothing here limits your rights as a consumer under Indian law.
    </p>
    <h2>Governing law</h2>
    <p>
      These terms are governed by the laws of India. Disputes are subject to the courts at the
      location of our registered office. We may update these terms; the date above shows the latest
      version.
    </p>
    <p>Questions: {email}.</p>
  </LegalPage>
);

export const PrivacyPage = () => (
  <LegalPage title="Privacy policy" summary="What we collect, why, and the choices you have.">
    <Operator />
    <h2>What we collect</h2>
    <ul>
      <li>Account: your email address (used to sign you in with a link) and name.</li>
      <li>Delivery: saved addresses, area and, if you choose “Use my location”, your location.</li>
      <li>Orders: what you ordered, the bill, order status and payment status.</li>
      <li>
        Payments: handled by Razorpay. We receive the payment’s status and reference, never your
        full card number, CVV, UPI PIN or bank login.
      </li>
      <li>
        Technical: basic logs such as errors and the time of a request, to keep the site safe.
      </li>
    </ul>
    <h2>Why we use it</h2>
    <p>
      To take, deliver and support your orders, prevent fraud, meet tax and legal duties, and
      improve the service. We do not sell your personal data.
    </p>
    <h2>Who receives it</h2>
    <ul>
      <li>The restaurant and the delivery partner see what they need to prepare and deliver.</li>
      <li>Razorpay processes your payment under its own privacy policy.</li>
      <li>
        Google (Firebase) hosts the site and stores our data, in servers that may be outside India.
      </li>
      <li>Authorities, where the law requires it.</li>
    </ul>
    <h2>Cookies and storage</h2>
    <p>
      We use browser storage to keep you signed in and to remember your cart and chosen area. We do
      not use advertising cookies. Razorpay may set its own cookies while you pay.
    </p>
    <h2>How long we keep it</h2>
    <p>
      Account data until you ask us to delete it. Order and payment records for as long as tax and
      accounting law require (generally up to 8 years).
    </p>
    <h2>Your choices</h2>
    <p>
      You can view and edit your profile and addresses in your account. To access, correct or delete
      your data, or withdraw consent, write to {email}. We respond within 30 days.
    </p>
    <h2>Security</h2>
    <p>
      Traffic is encrypted, prices and payments are decided only on our servers, and access to data
      is restricted by rules. No system is perfectly secure; tell us at once if you suspect a
      problem.
    </p>
    <p>
      Grievance officer: {b.grievanceOfficer}, {email}.
    </p>
  </LegalPage>
);

export const RefundsPage = () => (
  <LegalPage
    title="Refunds & cancellations"
    summary="When you can cancel an order and how refunds work."
  >
    <Operator />
    <h2>Cancelling an order</h2>
    <ul>
      <li>
        <strong>Before you pay</strong>: leave the payment screen. Nothing is charged and unpaid
        orders expire after 30 minutes.
      </li>
      <li>
        <strong>After you pay, before the restaurant accepts</strong>: contact us straight away and
        we will cancel it and refund you in full.
      </li>
      <li>
        <strong>Once the restaurant is preparing your food</strong>: it can no longer be cancelled,
        because the food is already being made.
      </li>
    </ul>
    <h2>When you get a refund</h2>
    <ul>
      <li>Money was deducted but the order was not confirmed.</li>
      <li>We or the restaurant cancel your order.</li>
      <li>The order was not delivered.</li>
      <li>
        The wrong or a missing item was delivered, or the food was unfit to eat; tell us within 24
        hours with the order number (a photo helps). We refund the affected items, or the whole
        order if it cannot be used.
      </li>
    </ul>
    <p>We do not refund for a change of mind after the food has been prepared.</p>
    <h2>How and when</h2>
    <p>
      Refunds go back to the method you paid with (card, UPI, netbanking or wallet) and usually
      reach you in {b.refundDays} after we approve them, depending on your bank. Duplicate charges
      are returned in full. Refunds are handled by our support team: write to {email} or call{' '}
      {b.supportPhone}. We reply within 2 working days.
    </p>
  </LegalPage>
);

export const ShippingPage = () => (
  <LegalPage
    title="Shipping & delivery"
    summary="Where we deliver, how long it takes and what it costs."
  >
    <Operator />
    <h2>Where we deliver</h2>
    <p>
      We deliver within the areas of {cities} shown in the app, from restaurants up to 8 km from
      your address. Enter your address at checkout; if it is out of range we tell you before you
      pay. We do not ship goods outside these areas.
    </p>
    <h2>How long it takes</h2>
    <p>
      Each restaurant shows its usual delivery time. It is an estimate: busy hours, weather and
      distance can add time, and you can follow your order live on its order page.
    </p>
    <h2>Delivery charges</h2>
    <p>
      The delivery fee depends on the distance between the restaurant and you: ₹25 up to 3 km, ₹40
      up to 6 km and ₹55 up to 8 km, plus a platform fee and applicable GST. The full amount is
      shown in the bill before you pay, and some coupons make delivery free.
    </p>
    <h2>At your door</h2>
    <p>
      Keep your phone on: the delivery partner may call to find you. If we cannot reach you or
      deliver, see our <Link to="/refunds">refund policy</Link>. Questions: {email}.
    </p>
  </LegalPage>
);
