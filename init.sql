-- Create the database
-- CREATE DATABASE chatapp;

-- Switch to the newly created database
-- \c chatapp;

-- Create the mainroom table
CREATE TABLE IF NOT EXISTS mainroom (
    id serial PRIMARY KEY,
    name VARCHAR(255),
    text TEXT,
    time TIMESTAMP
);

-- Create the conferenceroom table
CREATE TABLE IF NOT EXISTS conferenceroom (
    id serial PRIMARY KEY,
    name VARCHAR(255),
    text TEXT,
    time TIMESTAMP
);

-- Create the breakroom table
CREATE TABLE IF NOT EXISTS breakroom (
    id serial PRIMARY KEY,
    name VARCHAR(255),
    text TEXT,
    time TIMESTAMP
);
