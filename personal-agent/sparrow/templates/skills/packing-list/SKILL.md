---
name: packing-list
description: Make a packing list for a trip from the destination, length
  and purpose, using what you remember about the owner.
---
# Packing List

1. Ask for anything missing: destination, number of nights, purpose.
2. Call memory_search with "travel" and "packing" for the owner's habits
   (for example, always forgets a charger).
3. Write the list with write_file as `packing-<destination>.md`, grouped
   into Clothes, Toiletries, Tech, Documents, Other.
4. Reply with the file name and the three items most often forgotten.
