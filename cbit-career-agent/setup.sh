#!/bin/bash

# CBIT Personal AI Career Agent - Setup Script
# This script sets up the entire project including dependencies, environment, and initial configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
            exit 1
        fi
        print_success "Node.js version: $(node -v)"
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
}

# Function to check MongoDB
check_mongodb() {
    if command_exists mongod; then
        print_success "MongoDB is installed"
    else
        print_warning "MongoDB is not installed. Please install MongoDB 6.0 or higher."
        print_status "You can install MongoDB using:"
        echo "  Ubuntu/Debian: sudo apt-get install mongodb"
        echo "  macOS: brew install mongodb/brew/mongodb-community"
        echo "  Windows: Download from https://www.mongodb.com/try/download/community"
    fi
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p backend/uploads
    mkdir -p backend/logs
    mkdir -p worker/logs
    mkdir -p frontend/.next
    mkdir -p nginx/ssl
    mkdir -p nginx/logs
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    mkdir -p scripts
    
    print_success "Directories created successfully"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install shared package dependencies
    cd shared
    npm install
    npm run build
    cd ..
    
    # Install backend dependencies
    cd backend
    npm install
    cd ..
    
    # Install frontend dependencies
    cd frontend
    npm install
    cd ..
    
    # Install worker dependencies
    cd worker
    npm install
    cd ..
    
    print_success "Dependencies installed successfully"
}

# Function to setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f backend/.env ]; then
        cp backend/.env.example backend/.env
        print_success "Backend .env file created"
    else
        print_warning "Backend .env file already exists"
    fi
    
    # Worker environment
    if [ ! -f worker/.env ]; then
        cp backend/.env worker/.env
        print_success "Worker .env file created"
    else
        print_warning "Worker .env file already exists"
    fi
    
    print_warning "Please update the .env files with your actual API keys and configuration"
}

# Function to setup MongoDB
setup_mongodb() {
    print_status "Setting up MongoDB..."
    
    if command_exists mongod; then
        # Start MongoDB if not running
        if ! pgrep -x "mongod" > /dev/null; then
            print_status "Starting MongoDB..."
            sudo systemctl start mongod || sudo service mongod start || true
        fi
        
        # Create database and user
        print_status "Setting up MongoDB database..."
        mongosh --eval "
            use cbit-career-agent;
            db.createUser({
                user: 'cbit_user',
                pwd: 'cbit_password_123',
                roles: [
                    { role: 'readWrite', db: 'cbit-career-agent' },
                    { role: 'dbAdmin', db: 'cbit-career-agent' }
                ]
            });
        " || print_warning "Could not create MongoDB user (MongoDB might not be running)"
        
        print_success "MongoDB setup completed"
    else
        print_warning "MongoDB not available, skipping setup"
    fi
}

# Function to build the project
build_project() {
    print_status "Building the project..."
    
    # Build shared package
    cd shared
    npm run build
    cd ..
    
    # Build backend
    cd backend
    npm run build
    cd ..
    
    # Build frontend
    cd frontend
    npm run build
    cd ..
    
    # Build worker
    cd worker
    npm run build
    cd ..
    
    print_success "Project built successfully"
}

# Function to create Docker files
create_docker_files() {
    print_status "Creating Docker configuration files..."
    
    # Backend Dockerfile
    cat > backend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create uploads and logs directories
RUN mkdir -p uploads logs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]
EOF

    # Frontend Dockerfile
    cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

CMD ["node", "server.js"]
EOF

    # Worker Dockerfile
    cat > worker/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create logs directory
RUN mkdir -p logs

# Expose health check port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the worker
CMD ["npm", "start"]
EOF

    print_success "Docker files created successfully"
}

# Function to create Nginx configuration
create_nginx_config() {
    print_status "Creating Nginx configuration..."
    
    mkdir -p nginx
    
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Upstream servers
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:5000;
    }

    # Main server block
    server {
        listen 80;
        server_name localhost;

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # File uploads
        location /uploads/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;" always;
    }
}
EOF

    print_success "Nginx configuration created successfully"
}

# Function to create monitoring configuration
create_monitoring_config() {
    print_status "Creating monitoring configuration..."
    
    mkdir -p monitoring
    
    # Prometheus configuration
    cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'backend'
    static_configs:
      - targets: ['backend:5000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'worker'
    static_configs:
      - targets: ['worker:3001']
    metrics_path: '/health'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'
    scrape_interval: 30s
EOF

    print_success "Monitoring configuration created successfully"
}

# Function to create startup script
create_startup_script() {
    print_status "Creating startup script..."
    
    cat > start.sh << 'EOF'
#!/bin/bash

# CBIT Career Agent - Startup Script

echo "🚀 Starting CBIT Personal AI Career Agent..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start the services
echo "📦 Starting services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

echo "✅ CBIT Career Agent is starting up!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "⚙️  Worker: http://localhost:3001"
echo "📊 Prometheus: http://localhost:9090"
echo "📈 Grafana: http://localhost:3002 (admin/admin123)"
echo ""
echo "📝 Logs: docker-compose logs -f [service_name]"
echo "🛑 Stop: docker-compose down"
EOF

    chmod +x start.sh
    
    print_success "Startup script created successfully"
}

# Function to create development script
create_dev_script() {
    print_status "Creating development script..."
    
    cat > dev.sh << 'EOF'
#!/bin/bash

# CBIT Career Agent - Development Script

echo "🔧 Starting CBIT Career Agent in development mode..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    sudo systemctl start mongod || sudo service mongod start || true
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install:all
fi

# Start all services in development mode
echo "🚀 Starting development servers..."
npm run dev
EOF

    chmod +x dev.sh
    
    print_success "Development script created successfully"
}

# Main setup function
main() {
    echo "🎓 CBIT Personal AI Career Agent - Setup Script"
    echo "================================================"
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_node_version
    check_mongodb
    
    # Create directories
    create_directories
    
    # Install dependencies
    install_dependencies
    
    # Setup environment
    setup_environment
    
    # Setup MongoDB
    setup_mongodb
    
    # Build project
    build_project
    
    # Create Docker files
    create_docker_files
    
    # Create Nginx configuration
    create_nginx_config
    
    # Create monitoring configuration
    create_monitoring_config
    
    # Create startup scripts
    create_startup_script
    create_dev_script
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update the .env files with your API keys"
    echo "2. Start MongoDB if not already running"
    echo "3. Run './dev.sh' for development mode"
    echo "4. Run './start.sh' for production mode with Docker"
    echo ""
    echo "📚 Documentation: README.md"
    echo "🐛 Issues: Check the logs or create an issue"
    echo ""
}

# Run main function
main "$@"