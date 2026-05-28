export const filterProducts = (
  products = [],
  filters = {},
  purchasedIds = [],
) => {
  let result = [...products];

  const searchKeyword = filters.search?.trim().toLowerCase();
  const tagKeyword = filters.tag?.trim().toLowerCase();

  if (searchKeyword) {
    result = result.filter((game) => {
      const title = game.title?.toLowerCase() || "";
      const name = game.name?.toLowerCase() || "";
      const studio = game.studio?.toLowerCase() || "";
      const description = game.description?.toLowerCase() || "";

      return (
        title.includes(searchKeyword) ||
        name.includes(searchKeyword) ||
        studio.includes(searchKeyword) ||
        description.includes(searchKeyword)
      );
    });
  }

  if (tagKeyword) {
    result = result.filter((game) => {
      return game.gameTags?.some(
        (tag) => tag.name?.toLowerCase() === tagKeyword,
      );
    });
  }

  if (filters.price === "Free") {
    result = result.filter((game) => Number(game.price) === 0);
  }

  if (filters.price === "Paid") {
    result = result.filter((game) => Number(game.price) > 0);
  }

  if (filters.ownership === "Purchased") {
    result = result.filter((game) => purchasedIds.includes(String(game.id)));
  }

  if (filters.ownership === "Not Purchased") {
    result = result.filter((game) => !purchasedIds.includes(String(game.id)));
  }

  if (filters.sort === "Newest") {
    result.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
  }

  if (filters.sort === "Oldest") {
    result.sort(
      (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    );
  }

  if (filters.sort === "Price Low to High") {
    result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  }

  if (filters.sort === "Price High to Low") {
    result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  }

  if (filters.sort === "Top Rated") {
    result.sort(
      (a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0),
    );
  }

  return result;
};
