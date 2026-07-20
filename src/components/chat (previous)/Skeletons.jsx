export const ConversationsCardSkeleton = () => (
    <div className="animate-pulse  w-full">
        <div className="bg-gray-500/5 flex items-center flex-col gap-4 p-4">
            <div className='flex items-center justify-between gap-4 w-full'>
                <div className="h-10 w-10 rounded-full bg-gray-700"></div>
                <div className="h-3 w-16 rounded bg-gray-700"></div>
            </div>
            
            <div className="flex-1  w-full space-y-2">
                <div className="h-4 w-40 rounded bg-gray-700"></div>
                <div className="h-3 w-32 rounded bg-gray-700"></div>
            </div>
        </div>
    </div>
);

export const MessagesSkeleton = () => {
    return (
      <div className="space-y-6 p-4">
        {/* Incoming message skeleton */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
          
          <div className="flex-1">
            {/* Sender name */}
            <div className="h-3 w-24 rounded-full bg-gray-700 animate-pulse mb-2"></div>
            
            {/* Message bubble */}
            <div className="bg-gray-800 rounded-2xl p-4 max-w-[70%]">
              <div className="space-y-2">
                <div className="h-3 w-full rounded-full bg-gray-700 animate-pulse"></div>
                <div className="h-3 w-3/4 rounded-full bg-gray-700 animate-pulse"></div>
                <div className="h-3 w-1/2 rounded-full bg-gray-700 animate-pulse"></div>
              </div>
            </div>
            
            {/* Timestamp */}
            <div className="h-2 w-16 rounded-full bg-gray-700 animate-pulse mt-2 ml-2"></div>
          </div>
        </div>
  
        {/* Outgoing message skeleton */}
        <div className="flex items-start gap-3 justify-end">
          <div className="flex-1 flex flex-col items-end">
            {/* Sender name */}
            <div className="h-3 w-24 rounded-full bg-gray-700 animate-pulse mb-2"></div>
            
            {/* Message bubble */}
            <div className="bg-gray-800 rounded-2xl p-4 max-w-[70%]">
              <div className="space-y-2">
                <div className="h-3 w-full rounded-full bg-gray-700 animate-pulse"></div>
                <div className="h-3 w-4/5 rounded-full bg-gray-700 animate-pulse"></div>
              </div>
            </div>
            
            {/* Timestamp */}
            <div className="h-2 w-16 rounded-full bg-gray-700 animate-pulse mt-2 mr-2"></div>
          </div>
          
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
        </div>
  
        {/* Image message skeleton */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
          
          <div className="flex-1">
            <div className="h-3 w-24 rounded-full bg-gray-700 animate-pulse mb-2"></div>
            
            <div className="bg-gray-800 rounded-2xl p-4 max-w-[70%]">
              {/* Image placeholder */}
              <div className="w-48 h-32 rounded-lg bg-gray-700 animate-pulse mb-3"></div>
              
              <div className="space-y-2">
                <div className="h-3 w-32 rounded-full bg-gray-700 animate-pulse"></div>
              </div>
            </div>
            
            <div className="h-2 w-16 rounded-full bg-gray-700 animate-pulse mt-2 ml-2"></div>
          </div>
        </div>
  
        {/* Short message skeleton */}
        <div className="flex items-start gap-3 justify-end">
          <div className="flex-1 flex flex-col items-end">
            <div className="h-3 w-24 rounded-full bg-gray-700 animate-pulse mb-2"></div>
            
            <div className="bg-gray-800 rounded-2xl p-4 max-w-[50%]">
              <div className="h-3 w-32 rounded-full bg-gray-700 animate-pulse"></div>
            </div>
            
            <div className="h-2 w-16 rounded-full bg-gray-700 animate-pulse mt-2 mr-2"></div>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
        </div>
      </div>
    );
  };