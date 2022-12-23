# Query-Server (or "query helper service")
## Why do we need this?
The Supabase client, as lovely as it is, is limited for very complex queries.
While I'm sure we could call the postgres client from the website directly, I'm not confident enough
in my web dev/security skills to know that's safe compared to going through postgrest.