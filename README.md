# Research Method Calculator

A tool for calculating and visualizing research method recommendations.

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Supabase credentials (required for features to display in admin dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key

# Server-side Supabase credentials (used for admin operations)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Replace the placeholder values with your actual Supabase project credentials.

### 2. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com/) if you haven't already
2. Get your project URL and keys from the project settings
3. After the application is running, visit the admin page and click "Setup Database" to create the necessary tables

### 3. Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Features

- Feature matrix calculation and visualization
- Admin dashboard for managing feature data
- CSV import functionality
- Responsive design

## Troubleshooting

### Features not showing in Admin Dashboard

If features are not showing in the admin dashboard:

1. Make sure your `.env.local` file has the correct Supabase credentials
2. Click the "Setup Database" button on the admin page to create the necessary tables
3. Check the browser console for any error messages
4. Verify that the "features" table exists in your Supabase project

## License

[MIT License](LICENSE)