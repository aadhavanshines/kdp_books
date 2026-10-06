import { RestaurantPage } from '../../routes/RestaurantPage';
import { SearchPage } from '../../routes/SearchPage';
import { AddButton } from './AddButton';
import { CartSummary } from './CartSummary';
import { useCartHasItems } from './cartStore';

/** The restaurant page with ADD buttons and the desktop cart panel. */
export function RestaurantWithCart() {
  const hasItems = useCartHasItems();
  return (
    <RestaurantPage
      renderAction={(item, restaurant) => <AddButton restaurant={restaurant} item={item} />}
      aside={(restaurant) => <CartSummary restaurant={restaurant} />}
      bottomBarVisible={hasItems}
    />
  );
}

/** Search results with ADD buttons on dishes. */
export function SearchWithCart() {
  return (
    <SearchPage
      renderAction={(item, restaurant) => <AddButton restaurant={restaurant} item={item} />}
    />
  );
}
