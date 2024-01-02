FROM node:18

WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the init.sql file to a directory in the image
COPY init.sql /docker-entrypoint-initdb.d/

# Copy the rest of the application files to the working directory
COPY . .

# Set environment variables
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Define the command to run your application
CMD [ "npm", "start" ]
