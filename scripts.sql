sudo -u postgres psql


CREATE USER aeropuerto_user WITH PASSWORD 'admin123';
CREATE DATABASE db_aeropuerto OWNER aeropuerto_user;

\c db_aeropuerto

ALTER SCHEMA public OWNER TO aeropuerto_user;
GRANT ALL ON SCHEMA public TO aeropuerto_user;
GRANT CREATE ON SCHEMA public TO aeropuerto_user;

ALTER DEFAULT PRIVILEGES FOR USER aeropuerto_user IN SCHEMA public
GRANT ALL ON TABLES TO aeropuerto_user;

ALTER DEFAULT PRIVILEGES FOR USER aeropuerto_user IN SCHEMA public
GRANT ALL ON SEQUENCES TO aeropuerto_user;

ALTER DEFAULT PRIVILEGES FOR USER aeropuerto_user IN SCHEMA public
GRANT ALL ON FUNCTIONS TO aeropuerto_user;
