export const GetDatatableItems = (state) => {
  return Object.keys(state.rows.idRowsLookup).reduce(
    (prev, key) => {
      const member = state.rows.idRowsLookup[key];
      if (!member?.locked) {
        prev.newItems = [...prev.newItems, member];
      }

      prev.allItems = [...prev.allItems, member];

      return prev;
    },
    {
      newItems: [],
      allItems: []
    }
  );
};

export const GetDatatableChangedItems = (
  allItems,
  initialData,
  prop = "id"
) => {
  const result = initialData.reduce(
    (prev, curr) => {
      const item = allItems.find((i) => i[prop] === curr[prop]);

      if (!item) {
        prev.removedItems = [...prev.removedItems, curr];
      } else if (JSON.stringify(item) !== JSON.stringify(curr)) {
        prev.updatedItems = [...prev.updatedItems, item];
      } else {
        prev.noChangedItems = [...prev.noChangedItems, curr];
      }

      return prev;
    },
    {
      removedItems: [],
      updatedItems: [],
      noChangedItems: [],
      newItems: []
    }
  );
  allItems.forEach((admin) => {
    const item = initialData.find((a) => a[prop] === admin[prop]);
    if (!item) {
      result.newItems = [...result.newItems, admin];
    }
  });
  return result;
};

export const LockDatatableItems = (items) => {
  return items.map((member, index) => {
    return {
      ...member,
      id: index,
      locked: true
    };
  });
};
