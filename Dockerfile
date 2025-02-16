# Use the official Bun image as the base image
FROM oven/bun:1.2.2

# Set the working directory
WORKDIR /app

# Copy package.json and bun.lockb files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["bun", "run", "start"]
