/**
 * Calculate the value of one free week for a subscription plan.
 * Usage in Google Sheets:
 *   =ONEWEEKVALUE("basic")
 *   =ONEWEEKVALUE("standard")
 *   =ONEWEEKVALUE("premium")
 */
function ONEWEEKVALUE(plan) {
  plan = plan.toLowerCase();
  if(plan === "basic") return 30/4;      // $30 per month ≈ $7.50/week
  if(plan === "standard") return 45/4;   // $45 per month ≈ $11.25/week
  if(plan === "premium") return 60/4;    // $60 per month ≈ $15.00/week
  return "Unknown plan";
}

/**
 * Auto-fill one week value based on Plan column.
 * Example: =MAP(A2:A, ONEWEEKVALUE)
 */
