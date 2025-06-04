# Movie Search Application

A modern, responsive movie search application built with React, TypeScript, and Material-UI. This application allows users to search for movies using the OMDB API and view detailed information about each movie.

## Features

- Search movies by title
- View movie details including plot, cast, ratings, and more
- Responsive design for all screen sizes
- Dark mode interface
- Loading states and error handling
- Pagination for search results
- URL-based search and navigation

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OMDB API key (get it from [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx))

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd movie-search
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your OMDB API key:
   ```
   REACT_APP_OMDB_KEY=your_key_here
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
└── types/              # TypeScript type definitions
```

## Technologies Used

- React
- TypeScript
- Material-UI
- React Router
- Axios
- OMDB API

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
