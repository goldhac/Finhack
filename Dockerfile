# Unified Full-Stack Dockerfile (Client + Server + Python Worker)
FROM nikolaik/python-nodejs:python3.10-nodejs20-slim

WORKDIR /app

# 1. Install Python requirements globally in the container
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2. Build the React Client
# We copy package files first to leverage Docker layer caching
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm install
COPY client/ .
# The build output goes to /app/client/dist
RUN npm run build

# 3. Setup the Node Server
WORKDIR /app
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install
COPY server/ .

# 4. Copy data and python pipeline
WORKDIR /app
COPY data/ ./data/
COPY gssi_pipeline.py .

# 5. Populate Data Layer
# Execute the python script to generate /output artifacts right inside the image
RUN python3 gssi_pipeline.py

# 6. Configure Runtime Environment
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

# 7. Start the Express Server
WORKDIR /app/server
CMD ["npm", "start"]
