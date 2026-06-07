import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer Pricing API',
      version: '1.0.0',
      description:
        'Pricing profiles, overlap resolution, products and customers',
    },
    servers: [{ url: 'http://localhost:4000' }],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'prod_1' },
            title: { type: 'string', example: 'Koyama Methode Brut Nature NV' },
            sku: { type: 'string', example: 'WINE-SPARK-001' },
            subCategory: { type: 'string', example: 'Sparkling Wine' },
            segment: { type: 'string', example: 'Wine' },
            brand: { type: 'string', example: 'Koyama' },
            basePrice: { type: 'number', example: 120 },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cust_001' },
            name: { type: 'string', example: 'Bondi Cellars' },
          },
        },
        CustomerGroupMembership: {
          type: 'object',
          properties: {
            customerId: { type: 'string', example: 'cust_006' },
            customerGroupId: { type: 'string', example: 'grp_001' },
          },
        },
        PricingProfileItem: {
          type: 'object',
          properties: {
            productId: { type: 'string' },
            basePrice: { type: 'number' },
            adjustedPrice: { type: 'number' },
          },
        },
        PricingProfile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            customerScope: { type: 'string', enum: ['individual', 'group'] },
            customerId: { type: 'string' },
            customerGroup: { type: 'string' },
            adjustmentType: { type: 'string', enum: ['fixed', 'percentage'] },
            adjustmentDirection: {
              type: 'string',
              enum: ['increase', 'decrease'],
            },
            adjustmentValue: { type: 'number' },
            productScope: {
              type: 'string',
              enum: ['explicit', 'product', 'subCategory', 'segment', 'all'],
            },
            productFilter: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                subCategory: { type: 'string' },
                segment: { type: 'string' },
              },
            },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/PricingProfileItem' },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ResolveResult: {
          type: 'object',
          properties: {
            resolvedPrice: { type: 'number', nullable: true, example: 95 },
            sourceProfileId: {
              type: 'string',
              nullable: true,
              example: 'prof_scenario_c',
            },
            sourceProfileName: {
              type: 'string',
              nullable: true,
              example: 'Profile C',
            },
            explanation: {
              type: 'string',
              example:
                'Matched Profile C with score 20 (individual + exact product)',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
