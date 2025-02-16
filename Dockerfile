# Use the official Bun image as the base image
FROM oven/bun:1.2.2-debian

# Set the working directory
WORKDIR /app

# Install CURL (for health-checks)
RUN apt-get update && apt-get install -y \
    curl

# Copy package.json and bun.lockb files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the application
RUN bun run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["bun", "run", "start"]
