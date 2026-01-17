#!/usr/bin/env node

/**
 * Script to extract all Stored Procedures, Functions, and Triggers from MySQL database
 * This will generate complete CREATE statements for backup/documentation
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const fsSync = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Import database configuration from environment
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Handle SSL certificate if configured
const caPath = process.env.AIVEN_SSL_CA_PATH;
if (caPath) {
  try {
    const fullPath = path.join(__dirname, '..', '..', caPath);
    dbConfig.ssl = {
      ca: fsSync.readFileSync(fullPath).toString()
    };
  } catch (e) {
    console.log('SSL certificate not found, connecting without SSL');
  }
}

const outputDir = path.join(__dirname, '..', 'src/database');

async function extractDatabaseObjects() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!\n');

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    // Extract Schema (Tables)
    console.log('Extracting Schema (Tables)...');
    await extractSchema(connection);

    // Extract Stored Procedures
    console.log('Extracting Stored Procedures...');
    await extractProcedures(connection);

    // Extract Functions
    console.log('Extracting Functions...');
    await extractFunctions(connection);

    // Extract Triggers
    console.log('Extracting Triggers...');
    await extractTriggers(connection);

    // Extract Views
    console.log('Extracting Views...');
    await extractViews(connection);

    // Extract Indexes
    console.log('Extracting Indexes...');
    await extractIndexes(connection);

    console.log('\nExtraction completed successfully!');
    console.log(`Files saved to: ${outputDir}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function extractSchema(connection) {
  // Get all tables
  const [tables] = await connection.query(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
     ORDER BY TABLE_NAME`,
    [dbConfig.database]
  );

  let schema = `-- ============================================
-- Database Schema (Table Structures)
-- Database: ${dbConfig.database}
-- Generated: ${new Date().toISOString()}
-- ============================================
-- This file contains CREATE TABLE statements for all tables
-- ============================================\n\n`;

  schema += `CREATE DATABASE IF NOT EXISTS ${dbConfig.database};\n`;
  schema += `USE ${dbConfig.database};\n\n`;

  for (const table of tables) {
    const tableName = table.TABLE_NAME;
    console.log(`  - ${tableName}`);

    const [result] = await connection.query(`SHOW CREATE TABLE ${tableName}`);
    const createStatement = result[0]['Create Table'];

    schema += `-- Table: ${tableName}\n`;
    schema += `DROP TABLE IF EXISTS ${tableName};\n`;
    schema += createStatement;
    schema += `;\n\n`;
  }

  await fs.writeFile(
    path.join(outputDir, 'schema.sql'),
    schema
  );
  console.log(`  Saved ${tables.length} tables\n`);
}

async function extractProcedures(connection) {
  const [procedures] = await connection.query(
    `SELECT ROUTINE_NAME 
     FROM INFORMATION_SCHEMA.ROUTINES 
     WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'
     ORDER BY ROUTINE_NAME`,
    [dbConfig.database]
  );

  let allProcedures = `-- ============================================
-- Stored Procedures
-- Database: ${dbConfig.database}
-- Generated: ${new Date().toISOString()}
-- ============================================\n\n`;

  for (const proc of procedures) {
    const procName = proc.ROUTINE_NAME;
    console.log(`  - ${procName}`);

    const [result] = await connection.query(`SHOW CREATE PROCEDURE ${procName}`);
    const createStatement = result[0]['Create Procedure'];

    allProcedures += `-- Procedure: ${procName}\n`;
    allProcedures += `DROP PROCEDURE IF EXISTS ${procName};\n`;
    allProcedures += `DELIMITER $$\n`;
    allProcedures += createStatement;
    allProcedures += `$$\n`;
    allProcedures += `DELIMITER ;\n\n`;
  }

  await fs.writeFile(
    path.join(outputDir, 'stored_procedures.sql'),
    allProcedures
  );
  console.log(`  Saved ${procedures.length} procedures\n`);
}

async function extractFunctions(connection) {
  const [functions] = await connection.query(
    `SELECT ROUTINE_NAME 
     FROM INFORMATION_SCHEMA.ROUTINES 
     WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'FUNCTION'
     ORDER BY ROUTINE_NAME`,
    [dbConfig.database]
  );

  let allFunctions = `-- ============================================
-- Functions
-- Database: ${dbConfig.database}
-- Generated: ${new Date().toISOString()}
-- ============================================\n\n`;

  for (const func of functions) {
    const funcName = func.ROUTINE_NAME;
    console.log(`  - ${funcName}`);

    const [result] = await connection.query(`SHOW CREATE FUNCTION ${funcName}`);
    const createStatement = result[0]['Create Function'];

    allFunctions += `-- Function: ${funcName}\n`;
    allFunctions += `DROP FUNCTION IF EXISTS ${funcName};\n`;
    allFunctions += `DELIMITER $$\n`;
    allFunctions += createStatement;
    allFunctions += `$$\n`;
    allFunctions += `DELIMITER ;\n\n`;
  }

  await fs.writeFile(
    path.join(outputDir, 'functions.sql'),
    allFunctions
  );
  console.log(`  Saved ${functions.length} functions\n`);
}

async function extractTriggers(connection) {
  const [triggers] = await connection.query(
    `SELECT TRIGGER_NAME, EVENT_OBJECT_TABLE
     FROM INFORMATION_SCHEMA.TRIGGERS 
     WHERE TRIGGER_SCHEMA = ?
     ORDER BY EVENT_OBJECT_TABLE, TRIGGER_NAME`,
    [dbConfig.database]
  );

  let allTriggers = `-- ============================================
-- Triggers
-- Database: ${dbConfig.database}
-- Generated: ${new Date().toISOString()}
-- ============================================\n\n`;

  for (const trig of triggers) {
    const trigName = trig.TRIGGER_NAME;
    const tableName = trig.EVENT_OBJECT_TABLE;
    console.log(`  - ${trigName} (on ${tableName})`);

    const [result] = await connection.query(`SHOW CREATE TRIGGER ${trigName}`);
    const createStatement = result[0]['SQL Original Statement'];

    allTriggers += `-- Trigger: ${trigName}\n`;
    allTriggers += `-- Table: ${tableName}\n`;
    allTriggers += `DROP TRIGGER IF EXISTS ${trigName};\n`;
    allTriggers += `DELIMITER $$\n`;
    allTriggers += createStatement;
    allTriggers += `$$\n`;
    allTriggers += `DELIMITER ;\n\n`;
  }

  await fs.writeFile(
    path.join(outputDir, 'triggers.sql'),
    allTriggers
  );
  console.log(`Saved ${triggers.length} triggers\n`);
}

async function extractViews(connection) {
  const [views] = await connection.query(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.VIEWS
     WHERE TABLE_SCHEMA = ?
     ORDER BY TABLE_NAME`,
    [dbConfig.database]
  );

  let allViews = `-- ============================================
-- Views
-- Database: ${dbConfig.database}
-- Generated: ${new Date().toISOString()}
-- ============================================\n\n`;

  for (const view of views) {
    const viewName = view.TABLE_NAME;
    console.log(`  - ${viewName}`);

    const [result] = await connection.query(`SHOW CREATE VIEW ${viewName}`);
    const createStatement = result[0]['Create View'];

    allViews += `-- View: ${viewName}\n`;
    allViews += `DROP VIEW IF EXISTS ${viewName};\n`;
    allViews += createStatement;
    allViews += `;\n\n`;
  }

  await fs.writeFile(
    path.join(outputDir, 'views.sql'),
    allViews
  );
  console.log(`  Saved ${views.length} views\n`);
}

async function extractIndexes(connection) {
  // Get all tables first
  const [tables] = await connection.query(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
     ORDER BY TABLE_NAME`,
    [dbConfig.database]
  );

  let allIndexes = `-- ============================================
-- Indexes
-- Database: ${dbConfig.database}
-- Generated: ${new Date().toISOString()}
-- ============================================
-- Note: PRIMARY KEY and UNIQUE constraints are included in table structure
-- This file contains all non-primary indexes for reference
-- ============================================\n\n`;

  let indexCount = 0;

  for (const table of tables) {
    const tableName = table.TABLE_NAME;
    
    const [indexes] = await connection.query(
      `SELECT DISTINCT
         INDEX_NAME,
         NON_UNIQUE,
         GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS,
         INDEX_TYPE
       FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       GROUP BY INDEX_NAME, NON_UNIQUE, INDEX_TYPE
       ORDER BY INDEX_NAME`,
      [dbConfig.database, tableName]
    );

    if (indexes.length > 0) {
      allIndexes += `-- Table: ${tableName}\n`;
      
      for (const idx of indexes) {
        const indexName = idx.INDEX_NAME;
        const columns = idx.COLUMNS;
        const isUnique = idx.NON_UNIQUE === 0;
        const indexType = idx.INDEX_TYPE;
        
        console.log(`  - ${tableName}.${indexName}`);
        
        allIndexes += `-- Index: ${indexName} (${indexType}${isUnique ? ', UNIQUE' : ''})\n`;
        
        if (indexName === 'PRIMARY') {
          allIndexes += `-- PRIMARY KEY (${columns})\n`;
        } else {
          allIndexes += `DROP INDEX IF EXISTS ${indexName} ON ${tableName};\n`;
          allIndexes += `CREATE ${isUnique ? 'UNIQUE ' : ''}INDEX ${indexName} ON ${tableName} (${columns})`;
          if (indexType !== 'BTREE') {
            allIndexes += ` USING ${indexType}`;
          }
          allIndexes += `;\n`;
        }
        allIndexes += `\n`;
        indexCount++;
      }
      allIndexes += `\n`;
    }
  }

  await fs.writeFile(
    path.join(outputDir, 'indexes.sql'),
    allIndexes
  );
  console.log(`  Saved ${indexCount} indexes from ${tables.length} tables\n`);
}

// Run the script
extractDatabaseObjects();
