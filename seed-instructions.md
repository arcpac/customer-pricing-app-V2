 Local Seed Instructions

# from the backend/ directory
   cd /Users/antoniocaballes/Documents/foboh/v2/customer-pricing-app-v2/backend

# 1. Run migration (only needed once, or after schema changes)
   ```bash npx prisma migrate dev --name init```

 # 2. Seed the DB (safe to re-run — clears and re-creates all data)
   ```bash npx prisma db seed```

# 3. Start the server
 ```bash npm run dev```

## To wipe and re-seed at any time:
```bash npx prisma db seed   # seed.ts does deleteMany() before creating```

## To reset everything (drops DB, re-applies migration, re-seeds):
   ```bash npx prisma migrate reset   # prompts for confirmation```