#!/bin/bash

# TruthChain - Aleo Testnet Deployment Script
# This script deploys the whistleblower_v1.aleo program to Aleo testnet

set -e

echo "======================================"
echo "TruthChain Deployment Script"
echo "======================================"

# Check if Leo is installed
if ! command -v leo &> /dev/null; then
    echo "Error: Leo CLI not found. Please install it first."
    echo "Visit: https://developer.aleo.org/getting_started/"
    exit 1
fi

# Configuration
PROGRAM_DIR="../contracts/whistleblower_v1"
NETWORK="testnet"
ENDPOINT="https://api.explorer.provable.com/v1"

# Check for private key argument
if [ -z "$1" ]; then
    echo ""
    echo "Usage: ./deploy.sh <PRIVATE_KEY>"
    echo ""
    echo "To get testnet credits:"
    echo "1. Visit https://faucet.aleo.org/"
    echo "2. Enter your Aleo address"
    echo "3. Wait for 15 credits to arrive (takes ~1 minute)"
    echo ""
    echo "Deployment requires approximately 13.3 credits"
    echo ""

    # Generate a new account if needed
    echo "Generating new account for reference:"
    leo account new
    exit 1
fi

PRIVATE_KEY=$1

echo ""
echo "Network: $NETWORK"
echo "Endpoint: $ENDPOINT"
echo ""

# Navigate to program directory
cd $PROGRAM_DIR

# Build the program
echo "Building program..."
leo build

# Deploy
echo ""
echo "Deploying whistleblower_v1.aleo..."
echo "This will cost approximately 13.3 credits"
echo ""

leo deploy \
    --network $NETWORK \
    --endpoint $ENDPOINT \
    --private-key $PRIVATE_KEY \
    --broadcast \
    -y

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo "View your program at:"
echo "https://testnet.aleo.info/program/whistleblower_v1.aleo"
echo ""
