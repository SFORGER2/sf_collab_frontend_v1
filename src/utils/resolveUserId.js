export const resolveUserId = (userLike) =>
  userLike?.id ?? userLike?.user_id ?? userLike?.userId ?? null;
