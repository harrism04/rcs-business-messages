# RCS Campaign Manager

This project provides a frontend interface for building Rich Communication Services (RCS) Business Messages (also known as RBM). It's designed to be a part of a larger RBM campaign management system, but currently only implements the message building functionality.

## Features

- Build different types of RCS messages:
  - Text messages
  - Rich Cards
  - Carousels
  - Media messages (image, video, audio, PDF)
- Live preview of the created message
- Support for fallback SMS for non-RCS capable recipients

## Important Note

This project is currently a frontend-only implementation. It provides the user interface and local state management for building RCS messages, but does not include backend functionality for actually sending messages or managing campaigns. 

To create a full RCS campaign management system, you would need to:

1. Implement a backend service to handle message sending, campaign management, and data persistence.
2. Integrate with an RCS API provider or build your own RCS gateway.
3. Add authentication and authorization features.
4. Implement campaign tracking and analytics functionality.

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- React
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui components

## Contributing

This is an open-source project. Contributions, issues, and feature requests are welcome. Feel free to check issues page if you want to contribute.

## License

This project is licensed under the MIT License.
