import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getProfilePicture } from '@/utils/getProfilePicture';
import { usersAPI } from '@/utils/APIs/userAPI';
import { motion } from 'framer-motion';

export default function AddMemberModal({ isOpen, onClose, onSubmit, roles, formData, onFormChange }) {

  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.first_name || formData.last_name) {
        try {
          const response = await usersAPI.getAll({
            search: formData.first_name || formData.last_name,
            page: 1,
            per_page: 10
          });
          
          if (response.success && response.data?.users) {
            setUserResults(response.data.users);
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [formData.first_name, formData.last_name]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl font-bold">Add Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <label className="text-sm text-gray-300 mb-2 block font-medium">First Name</label>
              <Input
                required={!selectedUser}
                value={formData.first_name}
                onChange={(e) => onFormChange({ ...formData, first_name: e.target.value })}
                placeholder="Enter first name"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <label className="text-sm text-gray-300 mb-2 block font-medium">Last Name</label>
              <Input
                required={!selectedUser}
                value={formData.last_name}
                onChange={(e) => onFormChange({ ...formData, last_name: e.target.value })}
                placeholder="Enter last name"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
              />
            </motion.div>
          </div>

          {userResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className='flex flex-col gap-2 max-h-64 overflow-y-auto bg-gray-700/30 rounded-lg p-3 border border-gray-600/50'
            >
              <p className="text-xs text-gray-400 px-2">Search Results</p>
              {userResults.map((user, idx) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setSelectedUser(user.id);
                    onFormChange({
                      user_id: user.id,
                      first_name: user.firstName,
                      last_name: user.lastName,
                    });
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer border ${
                    selectedUser === user.id 
                      ? 'bg-blue-500/20 border-blue-500/50' 
                      : 'bg-gray-700/50 border-gray-600/30 hover:border-gray-500/50'
                  }`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={getProfilePicture(user)} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-semibold text-xs">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{user.firstName} {user.lastName}</p>
                    <p className="text-gray-400 text-xs">{user.role}</p>
                  </div>
                  {selectedUser === user.id && (
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/50 text-xs flex-shrink-0">
                      Selected
                    </Badge>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label className="text-sm font-medium text-gray-300 mb-3 block">
              Roles
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.keys(roles).map((role, idx) => {

                return (
                  <motion.button
                    key={role}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onFormChange({
                        ...formData,
                        role
                      });
                    }}
                    className={`
                      flex items-center justify-center px-3 py-2 rounded-lg border text-sm capitalize
                      transition-all font-medium
                      ${
                        role === formData.role
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/20'
                          : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                      }
                    `}
                  >
                    {role}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <motion.div 
            className="flex gap-3 pt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-gray-600 bg-gray-700 text-white hover:bg-gray-600 hover:border-gray-500 transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/50 transition-all font-medium"
            >
              Add Member
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
