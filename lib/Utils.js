module.exports = {
    isValidFilename: function( filename ) {
        if ( filename.length === 0 ) {
            return false;
        }

        // Check there aren't multiple slashes.
        if ( ( filename.split( "/" ).length ) > 2 ) {
            return false;
        }

        var fnsplit = filename.split( "." );

        // Check there aren't multiple periods.
        if ( fnsplit.length > 2 ) {
            return false;
        }

        var namelen = fnsplit[ 0 ].length;
        var extlen = fnsplit[ 1 ] ? fnsplit[ 1 ].length : 0;

        if ( namelen === 0 || namelen > 8 || extlen > 3 ) {
            return false;
        }

        return true;
    }

};

