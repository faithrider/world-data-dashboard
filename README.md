# World Income & Life Expectancy Visualizer
A data visualization web application for exploring global income distribution and life expectancy trends across countries and years.

Built by Faith Rider | [Demo Video](https://mailuc-my.sharepoint.com/:v:/g/personal/riderfm_mail_uc_edu/IQBcWNh-abK7RKwIey_Kl6MzAR4RSxBUmJtX0wX_T0UCZ60?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D&e=13ofbX) | [Live Site](https://world-data-dashboard-delta.vercel.app/) | [Source Code](https://github.com/faithrider/UI-project-1)

## Project Overview
World Income & Life Expectancy Visualizer is an interactive web app designed to help users explore how income and life expectancy vary around the world. The application combines multiple datasets and geospatial data to provide a clear, engaging view of global development patterns over time.

### Key Features
- Interactive World Map: Visualize country-level data on income and life expectancy using color-coded choropleth maps
- Year Selection: Explore changes over time with a dynamic year slider
- Data Tooltips: Hover over countries to see detailed statistics for each year
- Comparative Insights: Compare income share distributions and life expectancy between countries and regions

### Design Process
Research & Data Sourcing
The project began with a focus on understanding global development indicators and how best to communicate them visually. Data was sourced from Our World in Data and combined for a comprehensive view.

### Questions Explored
- How do income and life expectancy vary across countries?
- What global patterns emerge over time?
- How can users intuitively compare countries and regions?

### Key Insights from Research:
- Users value the ability to see both macro (global) and micro (country-level) trends
- Interactivity (hover, select, compare) increases engagement and understanding
- Clean, uncluttered visuals help users focus on key insights

## Interface Design
### Main Navigation
- Header with app title and year selector
- Interactive world map as the main view
- Sidebar or modal for country details and data breakdowns

![Main header](https://github.com/faithrider/world-data-dashboard/blob/main/screenshots/main.png)

### Map & Data Visualization
- Choropleth map using D3.js for color scaling
- Tooltips with country name, income, and life expectancy
- Optional charts for income share distribution

![Basic data histograms](https://github.com/faithrider/world-data-dashboard/blob/main/screenshots/histograms.png)
![Scatterplot](https://github.com/faithrider/world-data-dashboard/blob/main/screenshots/scatterplot.png)
![Choropleth map showing income distributions](https://github.com/faithrider/world-data-dashboard/blob/main/screenshots/choropleth-income.png)
![Choropleth map showing life expectancy distributions](https://github.com/faithrider/world-data-dashboard/blob/main/screenshots/choropleth-life.png)

### Technical Implementation
Technology Stack
- Frontend: HTML, CSS, JavaScript (D3.js for visualization)
- Data: CSV files for income, life expectancy, and income share; GeoJSON for world map

### File Structure
- index.html: Main HTML file
- style.css: Application styling
- main.js: JavaScript logic and D3 visualizations
- world.geojson: Geospatial data for countries
- combined_all_years.csv: Main dataset (income/life expectancy by country/year)
- income-share-distribution-before-tax-wid.csv: Income share data
- life-expectancy.csv: Life expectancy data

### Data Management
- Data loaded and parsed from CSV/GeoJSON at runtime
- Dynamic filtering and aggregation for selected year/country
- Responsive updates to map and charts on user interaction

### Key Implementation Details
- D3.js for map rendering, color scales, and tooltips
- Modular JavaScript for data loading, UI controls, and rendering
- CSS for responsive layout and accessible color schemes

## Use of AI in Development
### AI Tools Utilized:
- GitHub Copilot: Assisted with D3.js code, data parsing, and debugging
- ChatGPT: Provided design feedback and troubleshooting support

## Possible Future Development
### Planned Enhancements
Phase 1: Data Expansion
- Add more years and indicators (education, health, etc.)
- Enable region-based filtering and comparison

Phase 2: Advanced Analytics
- Trend lines and historical comparisons
- Export charts and data for reports

Phase 3: User Customization
- Save favorite countries or views
- Shareable links for custom visualizations

Attempted Features
- Explored brushing data to select desired pieces, but prioritized performance and clarity
- Considered including more datasets, but chose to keep it simpler and working
