/**
 * QuantumScribe Supabase Integration Verification Script
 * 
 * This script verifies that the Supabase integration for QuantumScribe is correctly set up
 * by testing authentication, data storage, and data segregation.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(chalk.red('Error: Missing Supabase environment variables. Check your .env file.'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test users
const testUser1 = {
  email: `test1_${Date.now()}@example.com`,
  password: 'Password123!',
  fullName: 'Test User One'
};

const testUser2 = {
  email: `test2_${Date.now()}@example.com`,
  password: 'Password123!',
  fullName: 'Test User Two'
};

// Test data
const testProject = {
  name: 'Test Project',
  description: 'A test project for verification'
};

const testEpic = {
  title: 'Test Epic',
  description: 'A test epic for verification',
  status: 'planning'
};

const testStory = {
  title: 'Test Story',
  description: 'A test story for verification',
  status: 'todo',
  priority: 'medium',
  points: 3
};

// Test file for storage
const testFile = new Blob(['Test file content'], { type: 'text/plain' });

// Helper function to log results
const logResult = (testName, success, message = '') => {
  if (success) {
    console.log(chalk.green(`✓ ${testName}`));
  } else {
    console.log(chalk.red(`✗ ${testName}`));
    if (message) {
      console.log(chalk.yellow(`  ${message}`));
    }
  }
};

// Helper function to clean up test data
const cleanupTestData = async (userId) => {
  try {
    // Delete test user
    await supabase.auth.admin.deleteUser(userId);
    console.log(chalk.gray(`Cleaned up test user: ${userId}`));
  } catch (error) {
    console.error(chalk.red(`Error cleaning up test data: ${error.message}`));
  }
};

// Main verification function
const verifySupabaseIntegration = async () => {
  console.log(chalk.blue('=== QuantumScribe Supabase Integration Verification ==='));
  
  let user1 = null;
  let user2 = null;
  let user1Client = null;
  let user2Client = null;
  
  try {
    // 1. Test Authentication
    console.log(chalk.blue('\n1. Testing Authentication'));
    
    // 1.1 Sign up test user 1
    const { data: signUpData1, error: signUpError1 } = await supabase.auth.signUp({
      email: testUser1.email,
      password: testUser1.password,
      options: {
        data: {
          full_name: testUser1.fullName,
        }
      }
    });
    
    logResult('Sign up user 1', !signUpError1, signUpError1?.message);
    if (signUpError1) throw new Error(`Failed to sign up user 1: ${signUpError1.message}`);
    user1 = signUpData1.user;
    
    // 1.2 Sign up test user 2
    const { data: signUpData2, error: signUpError2 } = await supabase.auth.signUp({
      email: testUser2.email,
      password: testUser2.password,
      options: {
        data: {
          full_name: testUser2.fullName,
        }
      }
    });
    
    logResult('Sign up user 2', !signUpError2, signUpError2?.message);
    if (signUpError2) throw new Error(`Failed to sign up user 2: ${signUpError2.message}`);
    user2 = signUpData2.user;
    
    // 1.3 Sign in as user 1
    const { data: signInData1, error: signInError1 } = await supabase.auth.signInWithPassword({
      email: testUser1.email,
      password: testUser1.password,
    });
    
    logResult('Sign in user 1', !signInError1, signInError1?.message);
    if (signInError1) throw new Error(`Failed to sign in user 1: ${signInError1.message}`);
    
    // Create a client for user 1
    user1Client = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${signInData1.session.access_token}`
        }
      }
    });
    
    // 1.4 Sign in as user 2
    const { data: signInData2, error: signInError2 } = await supabase.auth.signInWithPassword({
      email: testUser2.email,
      password: testUser2.password,
    });
    
    logResult('Sign in user 2', !signInError2, signInError2?.message);
    if (signInError2) throw new Error(`Failed to sign in user 2: ${signInError2.message}`);
    
    // Create a client for user 2
    user2Client = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${signInData2.session.access_token}`
        }
      }
    });
    
    // 2. Test Data Storage
    console.log(chalk.blue('\n2. Testing Data Storage'));
    
    // 2.1 Create a project as user 1
    const projectData = {
      name: testProject.name,
      description: testProject.description,
      owner_id: user1.id
    };
    
    const { data: projectResult, error: projectError } = await user1Client
      .from('projects')
      .insert(projectData)
      .select()
      .single();
    
    logResult('Create project', !projectError, projectError?.message);
    if (projectError) throw new Error(`Failed to create project: ${projectError.message}`);
    
    // 2.2 Create an epic as user 1
    const epicData = {
      title: testEpic.title,
      description: testEpic.description,
      status: testEpic.status,
      project_id: projectResult.id,
      owner_id: user1.id
    };
    
    const { data: epicResult, error: epicError } = await user1Client
      .from('epics')
      .insert(epicData)
      .select()
      .single();
    
    logResult('Create epic', !epicError, epicError?.message);
    if (epicError) throw new Error(`Failed to create epic: ${epicError.message}`);
    
    // 2.3 Create a story as user 1
    const storyData = {
      title: testStory.title,
      description: testStory.description,
      status: testStory.status,
      priority: testStory.priority,
      points: testStory.points,
      epic_id: epicResult.id,
      reporter_id: user1.id,
      assignee_id: user1.id
    };
    
    const { data: storyResult, error: storyError } = await user1Client
      .from('stories')
      .insert(storyData)
      .select()
      .single();
    
    logResult('Create story', !storyError, storyError?.message);
    if (storyError) throw new Error(`Failed to create story: ${storyError.message}`);
    
    // 3. Test Data Segregation
    console.log(chalk.blue('\n3. Testing Data Segregation'));
    
    // 3.1 User 1 should be able to read their own project
    const { data: user1Projects, error: user1ProjectsError } = await user1Client
      .from('projects')
      .select()
      .eq('id', projectResult.id);
    
    logResult('User 1 can read own project', 
      !user1ProjectsError && user1Projects.length === 1, 
      user1ProjectsError?.message);
    
    // 3.2 User 2 should not be able to read user 1's project
    const { data: user2Projects, error: user2ProjectsError } = await user2Client
      .from('projects')
      .select()
      .eq('id', projectResult.id);
    
    logResult('User 2 cannot read user 1\'s project', 
      !user2ProjectsError && user2Projects.length === 0, 
      user2ProjectsError?.message);
    
    // 3.3 User 1 should be able to read their own epic
    const { data: user1Epics, error: user1EpicsError } = await user1Client
      .from('epics')
      .select()
      .eq('id', epicResult.id);
    
    logResult('User 1 can read own epic', 
      !user1EpicsError && user1Epics.length === 1, 
      user1EpicsError?.message);
    
    // 3.4 User 2 should not be able to read user 1's epic
    const { data: user2Epics, error: user2EpicsError } = await user2Client
      .from('epics')
      .select()
      .eq('id', epicResult.id);
    
    logResult('User 2 cannot read user 1\'s epic', 
      !user2EpicsError && user2Epics.length === 0, 
      user2EpicsError?.message);
    
    // 3.5 User 1 should be able to read their own story
    const { data: user1Stories, error: user1StoriesError } = await user1Client
      .from('stories')
      .select()
      .eq('id', storyResult.id);
    
    logResult('User 1 can read own story', 
      !user1StoriesError && user1Stories.length === 1, 
      user1StoriesError?.message);
    
    // 3.6 User 2 should not be able to read user 1's story
    const { data: user2Stories, error: user2StoriesError } = await user2Client
      .from('stories')
      .select()
      .eq('id', storyResult.id);
    
    logResult('User 2 cannot read user 1\'s story', 
      !user2StoriesError && user2Stories.length === 0, 
      user2StoriesError?.message);
    
    // 4. Test Storage
    console.log(chalk.blue('\n4. Testing Storage'));
    
    // 4.1 Create a bucket if it doesn't exist
    const bucketName = 'project-files';
    const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
    });
    
    logResult('Create or verify bucket', 
      !createBucketError || createBucketError.message.includes('already exists'), 
      createBucketError?.message);
    
    // 4.2 User 1 uploads a file
    const filePath = `${user1.id}/test-file-${Date.now()}.txt`;
    const { data: uploadData, error: uploadError } = await user1Client.storage
      .from(bucketName)
      .upload(filePath, testFile);
    
    logResult('User 1 uploads file', !uploadError, uploadError?.message);
    if (uploadError) throw new Error(`Failed to upload file: ${uploadError.message}`);
    
    // 4.3 User 1 should be able to access their own file
    const { data: user1FileUrl, error: user1FileError } = await user1Client.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60);
    
    logResult('User 1 can access own file', 
      !user1FileError && user1FileUrl, 
      user1FileError?.message);
    
    // 4.4 User 2 should not be able to access user 1's file
    const { data: user2FileUrl, error: user2FileError } = await user2Client.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60);
    
    logResult('User 2 cannot access user 1\'s file', 
      user2FileError || !user2FileUrl, 
      'Expected access to be denied');
    
    // 5. Clean up
    console.log(chalk.blue('\n5. Cleaning up test data'));
    
    // 5.1 Delete the test file
    const { error: deleteFileError } = await user1Client.storage
      .from(bucketName)
      .remove([filePath]);
    
    logResult('Delete test file', !deleteFileError, deleteFileError?.message);
    
    // 5.2 Delete the test story
    const { error: deleteStoryError } = await user1Client
      .from('stories')
      .delete()
      .eq('id', storyResult.id);
    
    logResult('Delete test story', !deleteStoryError, deleteStoryError?.message);
    
    // 5.3 Delete the test epic
    const { error: deleteEpicError } = await user1Client
      .from('epics')
      .delete()
      .eq('id', epicResult.id);
    
    logResult('Delete test epic', !deleteEpicError, deleteEpicError?.message);
    
    // 5.4 Delete the test project
    const { error: deleteProjectError } = await user1Client
      .from('projects')
      .delete()
      .eq('id', projectResult.id);
    
    logResult('Delete test project', !deleteProjectError, deleteProjectError?.message);
    
    console.log(chalk.green('\n✓ Supabase integration verification completed successfully!'));
    console.log(chalk.gray('Note: Test users were created and will need to be deleted manually from the Supabase dashboard.'));
    
  } catch (error) {
    console.error(chalk.red(`\n✗ Verification failed: ${error.message}`));
  }
};

// Run the verification
verifySupabaseIntegration(); 