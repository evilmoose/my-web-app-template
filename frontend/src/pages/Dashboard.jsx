import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import LayoutWithScroll from '../components/LayoutWithScroll';

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();

  return (
    <LayoutWithScroll>
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-2xl font-bold text-primary mb-6">
          {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
        </h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">Welcome, {currentUser?.first_name || 'User'}!</h2>
          <p className="text-neutral-600">
            {isAdmin 
              ? 'This is your admin dashboard where you can manage content, users, and system settings.'
              : 'This is your personal dashboard where you can manage your workflows and settings.'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-100 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-primary mb-2">Project Proposals</h3>
            <p className="text-neutral-600 mb-4">
              View and manage your automation project proposals.
            </p>
            <Link to="/projects" className="text-accent-blue hover:underline font-medium">
              View Proposals
            </Link>
          </div>
          
          <div className="bg-neutral-100 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-primary mb-2">Notifications</h3>
            <p className="text-neutral-600 mb-4">
              Check your notifications.
            </p>
            <Link to="/notifications" className="text-accent-blue hover:underline font-medium">
              View Notifications
            </Link>
          </div>
          
          <div className="bg-neutral-100 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-primary mb-2">Blog</h3>
            <p className="text-neutral-600 mb-4">
              Read our latest blog posts.
            </p>
            <Link to="/blog" className="text-accent-blue hover:underline font-medium">
              View Blog
            </Link>
          </div>
          
          <div className="bg-neutral-100 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-primary mb-2">Settings</h3>
            <p className="text-neutral-600 mb-4">
              Manage your account and preferences.
            </p>
            <Link to="/profile" className="text-accent-blue hover:underline font-medium">
              View Settings
            </Link>
          </div>
          
          {isAdmin && (
            <>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-primary mb-2">User Management</h3>
                <p className="text-neutral-600 mb-4">
                  Manage user accounts and permissions.
                </p>
                <button className="text-accent-blue hover:underline font-medium">
                  View Users
                </button>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-primary mb-2">Blog Management</h3>
                <p className="text-neutral-600 mb-4">
                  Create and manage blog posts.
                </p>
                <Link to="/blog-admin" className="text-accent-blue hover:underline font-medium">
                  Manage Blog
                </Link>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-primary mb-2">Analytics</h3>
                <p className="text-neutral-600 mb-4">
                  View system analytics and reports.
                </p>
                <button className="text-accent-blue hover:underline font-medium">
                  View Analytics
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </LayoutWithScroll>
  );
};

export default Dashboard; 