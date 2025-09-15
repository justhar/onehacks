## Inspiration
We were inspired by seeing how much food goes to waste every day, while so many people struggle to access fresh meals. It felt wrong that perfectly good food was being thrown away. We wanted to create something that could make a difference by reducing food waste, making quality meals more accessible, and encouraging more conscious and sustainable habits.

Knowing that food waste contributes significantly to greenhouse gas emissions made us even more determined. We realized that even small actions could have a big environmental impact.
## What it does
Plateful is a platform that connects users with surplus meals from local restaurants. Our goal is to make high-quality food more accessible, affordable, and sustainable. Users can browse available meals near them, reserve or purchase them at a discount, and help reduce food waste. Restaurants can also choose to donate surplus meals to NGOs, ensuring that edible food reaches those in need instead of going to waste. Every meal saved or donated contributes to lowering food waste and greenhouse gas emissions.

## How we built it
Frontend
Built with React and Tailwind CSS for responsive design.
Components include MarketplaceHeader, MarketplaceFilters, and FoodItemCard.
Implemented search, sorting, and filtering to improve discoverability.

Backend
Used Drizzle ORM with Node.js for managing product data and locations.
Built APIs to fetch nearby products using user geolocation.

Midtrans was integrated as our payment gateway to handle secure transactions. We used their sandbox environment to test payments, simulate different payment methods, and ensure smooth order processing before going live. 

Location-Based Features
Users can set their location manually or use geolocation to find nearby food.
Calculated distances using the Haversine formula for better accuracy:

## Challenges we ran into
Data Fetching Issues
Integrating APIs with live geolocation sometimes failed due to permission errors. I solved this by providing a fallback to mock data and manual location input.
UI Responsiveness
Designing a layout that works seamlessly on both desktop and mobile required multiple iterations.
Handling Filters and Sorting
Applying multiple filters (price, category, restaurant) without slowing down the page needed careful state management.
Implementing payment processing with Midtrans, handling different payment methods and sandbox testing in a short development cycle.

## Accomplishments that we're proud of
Built a fully functional marketplace with search, filtering, and sorting in a very short timeframe.
Implemented location-based meal discovery to connect users with nearby food options quickly.
Created a workflow for restaurants to donate surplus meals to NGOs, giving food a second life.

## What we learned
Through building Plateful, we learned how to:
Work collaboratively to design and implement a user-centered platform.
Handle APIs, geolocation, and complex filtering in a performant way.
Appreciate the real impact of food waste on the environment and economy.
Translate an idea into a working product, iterating through design and technical challenges.

## What's next for Plateful
Track environmental and social impact for each meal saved or donated, showing users and restaurants the difference they’re making.
Scale the platform to more cities and partner with additional restaurants and NGOs to reduce food waste on a larger scale.
