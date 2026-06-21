export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostInput {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
}

export interface WorkExperience {
  role: string;
  company: string;
  period: string;
  location: string;
  highlights: string[];
  stack: string[];
}

export interface Project {
  title: string;
  description: string;
  highlights: string[];
  stack: string[];
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
}

// Single source of truth for the blog's seed/fallback content.
// Used by the server to initialise its local JSON DB and by the client
// as an offline fallback when the API is unreachable.
export const seedPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Building a Resilient SCD Type 2 Pipeline in BigQuery',
    slug: 'resilient-scd-type-2-pipeline-bigquery',
    excerpt: 'A deep dive into implementing Slowly Changing Dimensions (SCD) Type 2 in Google BigQuery using dbt and merge statements, with cost optimization in mind.',
    content: `# Building a Resilient SCD Type 2 Pipeline in BigQuery

When managing master data in a modern data lakehouse like BigQuery, tracking historical changes is crucial. Slowly Changing Dimensions (SCD) Type 2 is the gold standard for preserving history, but running full table scans on BigQuery can quickly become expensive.

In this article, we'll explore how to leverage **dbt** (Data Build Tool) snapshot features alongside custom partition strategies to build a highly optimized, cost-efficient, and resilient SCD Type 2 pipeline.

## The Challenge
BigQuery is a columnar storage engine where you pay for the number of bytes scanned. Traditional SCD Type 2 updates involve comparing the new data stream against the entire target table to detect updates and inserts. If your history spans hundreds of millions of rows, scanning this daily is a cost bottleneck.

## The Solution: dbt Snapshots + Partitions
dbt snapshots make capturing changed rows simple. Under the hood, dbt uses a \`MERGE\` statement. By configuring our target snapshot table to be partitioned by a date field (e.g., \`dbt_updated_at\`), we can drastically limit the query scan volume.

\`\`\`sql
-- Example of a dbt snapshot configuration
{% snapshot orders_snapshot %}

{{
    config(
      target_database='analytics_prod',
      target_schema='snapshots',
      unique_key='order_id',
      strategy='timestamp',
      updated_at='updated_at',
    )
}}

select * from {{ source('raw_store', 'orders') }}

{% endsnapshot %}
\`\`\`

## Monitoring and Data Quality
To ensure our pipeline is resilient:
1. **Primary Key Uniqueness:** Run dbt tests (\`unique\`, \`not_null\`) on \`unique_key\` to prevent duplicates.
2. **Gap Detection:** Ensure that for any record, \`dbt_valid_to\` of version N equals \`dbt_valid_from\` of version N+1.

In the next post, we will look into cost-optimizing BigQuery storage models using physical clustering keys.`,
    created_at: new Date('2026-05-10T10:00:00Z').toISOString(),
    updated_at: new Date('2026-05-10T10:00:00Z').toISOString()
  },
  {
    id: '2',
    title: 'Classifying Grapevine Diseases with Hyperspectral Machine Learning',
    slug: 'classifying-grapevine-diseases-hyperspectral-ml',
    excerpt: 'How we used high-dimensional hyperspectral images and Scikit-Learn to detect Flavescence dorée disease in grapevines before symptoms are visible to the naked eye.',
    content: `# Classifying Grapevine Diseases with Hyperspectral Machine Learning

Agricultural disease management is shifting from reactive treatment to proactive early detection. Flavescence dorée is a highly contagious grapevine disease that can devastate vineyards. In this post, I detail our research at UTAD utilizing machine learning on hyperspectral data to detect infections early.

## Why Hyperspectral Imaging?
Traditional cameras capture light in three bands: Red, Green, and Blue. Hyperspectral sensors capture light across hundreds of contiguous narrow wavelength bands, spanning the visible and near-infrared spectrum. This allows us to detect subtle changes in a leaf's chemical and structural composition (e.g., chlorophyll degradation) before physical discoloration is visible to the naked eye.

## The Pipeline
1. **Data Acquisition:** Capture hyperspectral cubes of healthy and infected grapevine leaves.
2. **Dimensionality Reduction:** Hyperspectral data is notoriously high-dimensional (often suffering from the "curse of dimensionality"). We applied Principal Component Analysis (PCA) to reduce hundreds of bands down to 8 principal components, preserving over 98% of variance.
3. **Model Selection:** We evaluated multiple machine learning classifiers:
   - Random Forest
   - Support Vector Machines (SVM)
   - K-Nearest Neighbors (KNN)

SVM with a radial basis function (RBF) kernel achieved the highest classification accuracy of **92.4%** on our test dataset.

## Impact
Early detection allows vineyard managers to isolate infected vines quickly, preventing widespread transmission and reducing the need for chemical insecticides.

Read our full publication in Elsevier's *Procedia Computer Science* [here](https://www.sciencedirect.com/science/article/pii/S1877050921022201).`,
    created_at: new Date('2026-06-01T14:30:00Z').toISOString(),
    updated_at: new Date('2026-06-01T14:30:00Z').toISOString()
  }
];
