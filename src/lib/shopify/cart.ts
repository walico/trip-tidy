import { Cart, ShopifyCart } from './types';

interface UpdateVariantResult {
  success: boolean;
  cart?: Cart;
  error?: string;
  details?: any;
}

export async function updateCartItemVariant(
  lineId: string, 
  variantId: string,
  cartId: string
): Promise<UpdateVariantResult> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 9);
  const TIMEOUT = 30000; // 30 seconds
  
  // Log the start of the operation
  console.log(`[${requestId}] Starting variant update`, {
    lineId: lineId.split('?')[0], // Clean up the lineId for logs
    variantId,
    cartId: cartId.split('?')[0], // Clean up the cartId for logs
    timestamp: new Date().toISOString()
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`[${requestId}] Request timeout after ${TIMEOUT}ms`);
      controller.abort();
    }, TIMEOUT);
    
    const apiUrl = '/api/cart/update-variant';
    
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      body: JSON.stringify({
        lineId,
        variantId,
        cartId,
        requestId, // Include in request body for correlation
      }),
      signal: controller.signal,
    };
    
    console.debug(`[${requestId}] Sending request to ${apiUrl}`, {
      method: 'POST',
      headers: fetchOptions.headers,
      body: JSON.parse(fetchOptions.body) // Log parsed body for better readability
    });
    
    const response = await fetch(apiUrl, fetchOptions);
    clearTimeout(timeoutId);
    
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Received response in ${duration}ms`, {
      status: response.status,
      statusText: response.statusText
    });
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        const errorData = JSON.parse(errorText);
        
        console.error(`[${requestId}] Server error response (${duration}ms)`, {
          status: response.status,
          error: errorData.error || 'No error details',
          response: errorData
        });
        
        return { 
          success: false, 
          error: errorData.error || `Server error: ${response.status} ${response.statusText}`,
          details: errorData
        };
      } catch (e) {
        console.error(`[${requestId}] Failed to parse error response (${duration}ms)`, {
          status: response.status,
          errorText,
          parseError: e
        });
        
        return { 
          success: false, 
          error: `Server returned ${response.status} ${response.statusText}`,
          details: { rawError: errorText }
        };
      }
    }

    const data = await response.json();
    console.log(`[${requestId}] Successfully updated variant (${duration}ms)`, {
      success: data.success,
      cartId: data.cart?.id?.split('?')[0],
      hasCart: !!data.cart
    });
    
    return { 
      success: true, 
      cart: data.cart,
      details: data
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        const errorMsg = `Request timed out after ${TIMEOUT}ms while updating variant`;
        console.error(`[${requestId}] ${errorMsg} (${duration}ms)`);
        return {
          success: false,
          error: errorMsg,
          details: { 
            timeout: true, 
            duration,
            requestId,
            lineId: lineId.split('?')[0],
            variantId,
            cartId: cartId.split('?')[0]
          }
        };
      }
      
      console.error(`[${requestId}] Error during variant update (${duration}ms)`, {
        error: error.message,
        name: error.name,
        stack: error.stack,
        requestId,
        duration
      });
      
      return { 
        success: false, 
        error: error.message,
        details: {
          name: error.name,
          stack: error.stack,
          requestId,
          duration
        }
      };
    }
    
    // Handle non-Error throws
    console.error(`[${requestId}] Unknown error (${duration}ms)`, {
      error,
      requestId,
      duration
    });
    
    return { 
      success: false, 
      error: 'An unknown error occurred',
      details: { error, requestId, duration }
    };
  }
}

