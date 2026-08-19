// Expanded expense taxonomy (team request 2026-08-14). 3 levels:
// main category → subcategory → (optional) sub-item.
export interface ExpenseSub {
  name: string
  items?: string[]
}
export interface ExpenseCategory {
  category: string
  subcategories: ExpenseSub[]
}

export const EXPENSE_TAXONOMY: ExpenseCategory[] = [
  {
    category: 'Operational Expenses',
    subcategories: [
      { name: 'Utilities', items: ['Electricity', 'Water', 'Gas'] },
      { name: 'Cleaning Supplies & Chemicals' },
      { name: 'Laundry & Linens' },
      { name: 'Maintenance & Repairs' },
      { name: 'Pest Control' },
      { name: 'Waste Management' },
      { name: 'Fuel & Transport' },
    ],
  },
  {
    category: 'Food & Beverage Expenses',
    subcategories: [
      { name: 'Food Purchases' },
      { name: 'Beverages' },
      { name: 'Kitchen Supplies' },
      { name: 'Cleaning Supplies' },
      { name: 'Packaging & Takeaway Supplies' },
    ],
  },
  {
    category: 'Bar Expenses',
    subcategories: [
      { name: 'Alcohol & Spirits' },
      { name: 'Mixers' },
      { name: 'Syrups & Garnishes' },
      { name: 'Ice' },
      { name: 'Glassware & Bar Supplies', items: ['Napkins', 'Straws', 'Coasters'] },
    ],
  },
  {
    category: 'Accommodation Expenses',
    subcategories: [
      { name: 'Linen & Towels' },
      { name: 'Toiletries & Amenities' },
      { name: 'Room Supplies', items: ['Tea', 'Coffee', 'Water'] },
      { name: 'Furniture & Fixtures' },
      { name: 'Mattresses & Bedding' },
    ],
  },
  {
    category: 'Staff & Payroll Expenses',
    subcategories: [
      { name: 'Salaries & Wages' },
      { name: 'Overtime' },
      { name: 'Staff Meals' },
      { name: 'Uniforms' },
      { name: 'Training & Development' },
      { name: 'Benefits & Allowances' },
    ],
  },
  {
    category: 'Facility Maintenance Expenses',
    subcategories: [
      { name: 'Building Repairs' },
      { name: 'Plumbing' },
      { name: 'Electrical' },
      { name: 'Painting' },
      { name: 'Roofing' },
      { name: 'Air Conditioning & Ventilation' },
      { name: 'Swimming Pool Maintenance' },
      { name: 'Garden & Landscaping' },
      { name: 'Beach & Water Park Maintenance' },
    ],
  },
  {
    category: 'Technology & Equipment Expenses',
    subcategories: [
      { name: 'Internet & Wi-Fi' },
      { name: 'Phone & Communications' },
      { name: 'Computers & Software' },
      { name: 'POS Systems' },
      { name: 'Security Cameras' },
      { name: 'Audio & Visual Equipment' },
      { name: 'Projectors & Screens' },
    ],
  },
  {
    category: 'Laundry Expenses',
    subcategories: [
      { name: 'Detergents & Chemicals' },
      { name: 'Dry Cleaning Supplies' },
      { name: 'Uniform Laundry' },
      { name: 'Guest Laundry Service Supplies' },
    ],
  },
  {
    category: 'Administration Expenses',
    subcategories: [
      { name: 'Office Supplies' },
      { name: 'Printing & Stationery' },
      { name: 'Bank Fees & Charges' },
      { name: 'Insurance' },
      { name: 'Legal & Accounting Fees' },
      { name: 'Licenses & Permits' },
    ],
  },
  {
    category: 'Marketing & Sales Expenses',
    subcategories: [
      { name: 'Advertising' },
      { name: 'Social Media' },
      { name: 'Website Hosting' },
      { name: 'Promotions & Discounts' },
      { name: 'Complimentary Items' },
      { name: 'Photography & Content' },
    ],
  },
  {
    category: 'Transport Expenses',
    subcategories: [
      { name: 'Vehicle Maintenance' },
      { name: 'Fuel' },
      { name: 'Guest Transfers' },
      { name: 'Delivery Transport' },
      { name: 'Procurement' },
    ],
  },
  {
    category: 'F&B Stock Expenses',
    subcategories: [
      { name: 'Cleaning Products' },
      { name: 'Maintenance Materials' },
      { name: 'Guest Amenities' },
      { name: 'Stationery' },
    ],
  },
  {
    category: 'Recreation & Activities Expenses',
    subcategories: [
      { name: 'Water Sports Equipment' },
      { name: 'Tour & Activity Supplies' },
      { name: 'Recreation Staff Supplies' },
      { name: 'Safety Equipment' },
    ],
  },
  {
    category: 'Financial Expenses',
    subcategories: [
      { name: 'Loan Repayments' },
      { name: 'Interest Charges' },
      { name: 'Credit Card Fees' },
      { name: 'Tax Payments' },
    ],
  },
]

export const EXPENSE_CATEGORY_NAMES = EXPENSE_TAXONOMY.map((c) => c.category)
