import pandas as pd

# Load both CSVs
df_poverty = pd.read_csv('income-share-distribution-before-tax-wid.csv')
df_life = pd.read_csv('life-expectancy.csv')

# Merge on Entity, Code, Year (inner join: only years/countries present in both)
df_merged = pd.merge(df_poverty, df_life, on=['Entity', 'Code', 'Year'], how='inner')

# Save to new CSV
df_merged.to_csv('combined_all_years.csv', index=False)

print('Merged file saved as combined_all_years.csv')
