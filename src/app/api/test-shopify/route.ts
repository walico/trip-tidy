import { NextResponse } from 'next/server';
import { shopifyClient, logShopifyConfig } from '@/lib/shopify';

export async function GET() {
  console.log('=== Testing Shopify Connection ===');
  
  // Log the current configuration
  const isConfigured = logShopifyConfig();
  
  if (!isConfigured) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Shopify not configured. Check environment variables.'
      },
      { status: 500 }
    );
  }

  try {
    // Test a simple query to verify the connection
    const query = `{
      shop {
        name
        primaryDomain {
          url
          host
        }
      }
    }`;

    console.log('Sending test query to Shopify...');
    const startTime = Date.now();
    const response = await shopifyClient.request(query);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Shopify connection successful (${duration}ms)`);
    
    return NextResponse.json({
      success: true,
      data: response,
      timing: `${duration}ms`
    });
    
  } catch (error) {
    console.error('Shopify connection test failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to Shopify',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
