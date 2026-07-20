export function isUserProfileComplete(user) {
    try {
        if (!user) {
            console.log("User object is null or undefined");
            return false;
        }
        
        const requiredFields = [
            'email',
            'firstName',
            'roles',
            'timezone'
        ];
        console.log("Checking user profile completeness for user:", user);
        for (const field of requiredFields) {
            const value = user[field];
            if (!value || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) {
                console.log(`Profile incomplete: Missing or empty field - ${field}`);
                return false;
            }
        }

        console.log("Profile is complete");
        return true;
    } catch (error) {
        console.error("An error occurred while checking user profile completeness:", error);
        return false;
    }
}