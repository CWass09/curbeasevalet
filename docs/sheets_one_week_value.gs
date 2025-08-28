/**
 * Return the monthly price for a given plan.
 * Usage in Sheets: =MONTHLYPRICE(C2)
 */
function MONTHLYPRICE(plan) {
  if (!plan) return "";
  plan = (""+plan).toLowerCase().trim();
  if (plan === "basic") return 30;
  if (plan === "standard") return 45;
  if (plan === "premium") return 60;
  return "";
}

/**
 * Return the "one week value" (monthly/4) for a given plan.
 * Usage in Sheets: =ONEWEEKVALUE(C2)
 */
function ONEWEEKVALUE(plan) {
  var price = MONTHLYPRICE(plan);
  if (price === "") return "";
  return Math.round((price/4)*100)/100;
}

/**
 * Example: auto-fill columns for new rows in a sheet named "Referrals".
 * Runs on edit; adjust column indices as needed.
 */
function onEdit(e) {
  try {
    var sh = e && e.range && e.range.getSheet();
    if (!sh || sh.getName() !== "Referrals") return;
    var row = e.range.getRow();
    if (row < 2) return;

    var plan = sh.getRange(row, 3).getValue(); // Column C = Plan
    var priceCell = sh.getRange(row, 4);       // Column D = Monthly Price
    var weekCell  = sh.getRange(row, 5);       // Column E = One Week Value

    if (!priceCell.getValue()) priceCell.setValue(MONTHLYPRICE(plan));
    if (!weekCell.getValue())  weekCell.setValue(ONEWEEKVALUE(plan));
  } catch (err) {
    // no-op
  }
}
