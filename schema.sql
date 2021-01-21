DROP TABLE place;

CREATE TABLE place(
  id SERIAL PRIMARY KEY,
  search_query VARCHAR,
  formatted_query VARCHAR,
  longitude DECIMAL,
  latitude DECIMAL
  
)