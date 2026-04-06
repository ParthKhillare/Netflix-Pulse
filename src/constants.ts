import { DbtModel } from './types';

export const DBT_MODELS: DbtModel[] = [
  {
    id: 'stg_events',
    name: 'stg_netflix__events',
    layer: 'Staging',
    description: 'Managed ingestion layer for global streaming events. Implements deduplication logic and initial schema normalization.',
    dependencies: [],
    tests: ['unique', 'not_null', 'accepted_values'],
    schema: [
      { name: 'event_id', type: 'STRING', desc: 'Primary key of the event' },
      { name: 'user_id', type: 'STRING', desc: 'Foreign key to users' },
      { name: 'event_at', type: 'TIMESTAMP', desc: 'Event occurrence time' },
      { name: 'content_id', type: 'STRING', desc: 'Identifier for content title' }
    ],
    compiledSql: `WITH raw_events AS (
  SELECT * FROM {{ source('netflix', 'events') }}
),
deduped AS (
  SELECT 
    *,
    ROW_NUMBER() OVER(PARTITION BY event_id ORDER BY ingested_at DESC) as rn
  FROM raw_events
)
SELECT 
  event_id,
  user_id,
  event_at,
  content_id
FROM deduped
WHERE rn = 1`
  },
  {
    id: 'int_subs_scd2',
    name: 'int_subscription_history_scd2',
    layer: 'Intermediate',
    description: 'Slowly Changing Dimension (Type 2) tracking for subscription lifecycle.',
    dependencies: ['stg_netflix__subscriptions'],
    tests: ['no_overlaps', 'recency'],
    schema: [
      { name: 'subscription_id', type: 'STRING', desc: 'Unique sub reference' },
      { name: 'plan_tier', type: 'STRING', desc: 'Basic, Standard, or Premium' },
      { name: 'valid_from', type: 'DATE', desc: 'Record activation date' },
      { name: 'is_current', type: 'BOOLEAN', desc: 'Current active record flag' }
    ],
    compiledSql: `SELECT
  subscription_id,
  user_id,
  plan_tier,
  status,
  valid_from,
  COALESCE(LEAD(valid_from) OVER (PARTITION BY user_id ORDER BY valid_from), '9999-12-31') AS valid_to,
  CASE 
    WHEN LEAD(valid_from) OVER (PARTITION BY user_id ORDER BY valid_from) IS NULL THEN TRUE 
    ELSE FALSE 
  END AS is_current
FROM {{ ref('stg_netflix__subscriptions') }}`
  },
  {
    id: 'fct_mrr',
    name: 'fct_monthly_recurring_revenue',
    layer: 'Marts',
    description: 'Consolidated financial grain for revenue reporting.',
    dependencies: ['int_daily_subscription_status', 'dim_exchange_rates'],
    tests: ['revenue_positive', 'not_null'],
    schema: [
      { name: 'date_day', type: 'DATE', desc: 'Reporting grain' },
      { name: 'mrr_usd', type: 'NUMERIC', desc: 'Aggregated Monthly Recurring Revenue' },
      { name: 'active_subscribers', type: 'INTEGER', desc: 'Unique paid member count' }
    ],
    compiledSql: `SELECT
  date_trunc(date_day, month) as mrr_month,
  region,
  SUM(CASE WHEN status = 'active' THEN subscription_price_usd ELSE 0 END) as mrr,
  COUNT(DISTINCT CASE WHEN status = 'active' THEN user_id END) as active_subs
FROM {{ ref('int_daily_subscription_status') }}
GROUP BY 1, 2`
  }
];

export const MOCK_METRICS = [
  { title: 'Global Revenue (MRR)', value: '$3.28B', change: 14.2, unit: 'USD' },
  { title: 'Paid Subscribers', value: '282.7M', change: 8.5, unit: 'Users' },
  { title: 'Avg Revenue Per Sub (ARM)', value: '$11.60', change: 2.1, unit: 'USD' },
  { title: 'Average Churn', value: '2.4%', change: -0.3, unit: 'Monthly' }
];

export const TREND_DATA_ACTUALS = [
  { name: 'Q1 23', mrr: 2800000000, churn: 2.8, subs: 232 },
  { name: 'Q2 23', mrr: 2950000000, churn: 2.7, subs: 238 },
  { name: 'Q3 23', mrr: 3100000000, churn: 2.5, subs: 247 },
  { name: 'Q4 23', mrr: 3250000000, churn: 2.9, subs: 260 },
  { name: 'Q1 24', mrr: 3380000000, churn: 2.4, subs: 269 },
  { name: 'Q2 24', mrr: 3520000000, churn: 2.3, subs: 277 },
  { name: 'Q3 24', mrr: 3750000000, churn: 2.2, subs: 282 },
  { name: 'Q4 24', mrr: 3950000000, churn: 2.1, subs: 291 },
];

export const SEASONALITY_HEATMAP = [
  { month: 'Jan', intensity: 95, label: 'Winter Peak' },
  { month: 'Feb', intensity: 88, label: 'High' },
  { month: 'Mar', intensity: 82, label: 'Mid' },
  { month: 'Apr', intensity: 65, label: 'Spring Dip' },
  { month: 'May', intensity: 58, label: 'Low' },
  { month: 'Jun', intensity: 45, label: 'Summer Low' },
  { month: 'Jul', intensity: 48, label: 'Summer Low' },
  { month: 'Aug', intensity: 60, label: 'Growth Rebound' },
  { month: 'Sep', intensity: 75, label: 'Fall Rise' },
  { month: 'Oct', intensity: 85, label: 'High' },
  { month: 'Nov', intensity: 92, label: 'Winter Peak' },
  { month: 'Dec', intensity: 100, label: 'Global Max' },
];