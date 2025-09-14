#!/usr/bin/env node

/**
 * Update projects.json with new project data
 * Usage: node update-showcase.js <project-data.json>
 */

const fs = require('fs');
const path = require('path');

function loadProjects() {
  const projectsPath = path.join(__dirname, '../data/projects.json');
  
  if (fs.existsSync(projectsPath)) {
    const data = fs.readFileSync(projectsPath, 'utf8');
    return JSON.parse(data);
  }
  
  return [];
}

function saveProjects(projects) {
  const projectsPath = path.join(__dirname, '../data/projects.json');
  const projectsDir = path.dirname(projectsPath);
  
  // Ensure directory exists
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
  }
  
  // Sort projects by approval date (newest first)
  projects.sort((a, b) => new Date(b.approvedAt) - new Date(a.approvedAt));
  
  fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2));
  console.log(`Updated projects.json with ${projects.length} projects`);
}

function addProject(newProject) {
  const projects = loadProjects();
  
  // Check if project already exists (by URL)
  const existingIndex = projects.findIndex(p => p.url === newProject.url);
  
  if (existingIndex >= 0) {
    // Update existing project
    projects[existingIndex] = { ...projects[existingIndex], ...newProject };
    console.log(`Updated existing project: ${newProject.name}`);
  } else {
    // Add new project
    projects.push(newProject);
    console.log(`Added new project: ${newProject.name}`);
  }
  
  saveProjects(projects);
  return projects;
}

function removeProject(issueNumber) {
  const projects = loadProjects();
  const filteredProjects = projects.filter(p => p.issueNumber !== issueNumber);
  
  if (filteredProjects.length < projects.length) {
    saveProjects(filteredProjects);
    console.log(`Removed project with issue number: ${issueNumber}`);
  } else {
    console.log(`No project found with issue number: ${issueNumber}`);
  }
  
  return filteredProjects;
}

// Main execution
if (require.main === module) {
  const projectDataPath = process.argv[2];
  
  if (!projectDataPath) {
    console.error('Error: Project data file path is required');
    process.exit(1);
  }
  
  try {
    const projectData = JSON.parse(fs.readFileSync(projectDataPath, 'utf8'));
    addProject(projectData);
  } catch (error) {
    console.error('Error updating showcase:', error.message);
    process.exit(1);
  }
}

module.exports = { loadProjects, saveProjects, addProject, removeProject };
