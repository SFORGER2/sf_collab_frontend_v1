import React, { useState, useEffect } from 'react';
import Canvas from './Canvas';
import '../style/PaintingBoard.css';
import PropTypes from 'prop-types';

const PaintingBoard = ({ conversationId, currentUserId ,wsClient}) => {
    const [showInstructions, setShowInstructions] = useState(true);
    
    // Auto-hide instructions after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowInstructions(false);
        }, 5000);
        
        return () => clearTimeout(timer);
    }, []);
    
    const handleInstructionsClose = () => {
        setShowInstructions(false);
    };
    
    return (
        <div className='painting-board-wrapper'>
            {showInstructions && (
                <div className="instructions-banner">
                    <div className="instructions-content">
                        <h3>🎨 Collaborative Whiteboard</h3>
                        <p>Draw together with others in real-time. All changes are synchronized instantly.</p>
                        <button 
                            className="close-instructions"
                            onClick={handleInstructionsClose}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
            
            <div className="canvas-container">
                {conversationId && currentUserId ? (
                    <Canvas 
                        conversationId={conversationId}
                        currentUserId={currentUserId}
                        wsClient={wsClient}
                    />
                ) : (
                    <div className="no-session-message">
                        <div className="message-content">
                            <h3>Select a Conversation</h3>
                            <p>To start drawing, please select a conversation from the sidebar.</p>
                            <div className="features-list">
                                <div className="feature">
                                    <span className="feature-icon">🎯</span>
                                    <span>Real-time collaboration</span>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">🔄</span>
                                    <span>Instant synchronization</span>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">👥</span>
                                    <span>See who's drawing</span>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">💾</span>
                                    <span>Save & share your work</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

PaintingBoard.propTypes = {
    conversationId: PropTypes.string,
    currentUserId: PropTypes.string,
    wsClient: PropTypes.object
};

// Default props for when not provided
PaintingBoard.defaultProps = {
    conversationId: null,
    currentUserId: null,
    wsClient: null
};

export default PaintingBoard;