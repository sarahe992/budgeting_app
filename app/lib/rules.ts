import type { CategoryRule } from "./types";

// Ordered most-specific-first: matching stops at the first hit, so a narrow
// pattern (e.g. a membership fee) needs to come before a broader one for the
// same merchant (e.g. the merchant's everyday purchases).
const STARTER_RULE_PAIRS: [keyword: string, categoryId: string][] = [
  ["WALMART+ MEMBER", "subscriptions"],
  ["WM SUPERCENTER", "household-groceries"],
  ["WAL-MART", "household-groceries"],
  ["WALMART", "household-groceries"],
  ["WHOLEFDS", "household-groceries"],
  ["WHOLE FOODS", "household-groceries"],

  ["UBR", "transportation"],
  ["UBER", "transportation"],
  ["RTD", "transportation"],
  ["SMARTRIP", "transportation"],
  ["VEO* CHARGE", "transportation"],
  ["METROPOLIS PARKING", "transportation"],
  ["PUBLIC PARKING", "transportation"],
  ["PAY BY PHONE", "transportation"],

  ["COFFEE", "out-to-eat"],
  ["CAFE", "out-to-eat"],
  ["CHIPOTLE", "out-to-eat"],
  ["CAVA", "out-to-eat"],
  ["TACO", "out-to-eat"],
  ["FOOD HALL", "out-to-eat"],
  ["BOARS HEAD", "out-to-eat"],
  ["RISTORANTE", "out-to-eat"],
  ["ICE CR", "out-to-eat"],
  ["KOLACHE", "out-to-eat"],
  ["MASALA", "out-to-eat"],
  ["GOLDEN MILL", "out-to-eat"],
  ["SWEET COW", "out-to-eat"],

  ["ANTHROPIC", "subscriptions"],
  ["OPENAI", "subscriptions"],
  ["CHATGPT", "subscriptions"],
  ["GFIBER", "subscriptions"],
  ["AUDIBLE", "subscriptions"],
  ["JOINLELAND", "subscriptions"],

  ["MAVERIK", "gas"],

  ["GOLDEN RIVER SPORT", "activities-fun"],
  ["FIFA WATCH PARTY", "activities-fun"],
  ["COLORADO ROCKIES", "activities-fun"],

  ["TEMPLE", "donations-tithing"],

  ["VENMO", "social-hosting-gifts"],

  ["AMAZON MKTPL", "random"],
];

export const STARTER_RULES: CategoryRule[] = STARTER_RULE_PAIRS.map(
  ([keyword, categoryId], i) => ({
    id: `rule_starter_${i}`,
    keyword,
    categoryId,
  })
);
