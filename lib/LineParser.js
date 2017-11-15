var    _ = require( "lodash" ),
    splitLimit = require( "split-limit" );

var LineParser = function( gshell ) {
    if ( !this._isLineParser ) {
        return new LineParser( gshell );
    }
    this._gshell = gshell;
};

_.extend( LineParser.prototype, {
    _isLineParser: true,

    _constructCommand: function( tokens ) {
        return {
            name: tokens[ 0 ],
            args: tokens.slice( 1 ).map( arg => arg.trim() ),
            result: null,
            exitCode: null,
            exitPrompt: true
        };
    },

    _tokenize: function( line ) {
        const trimLine = line.trim();
        if ( !trimLine ) {
            return;
        }

        return splitLimit( trimLine, " ");
    },

    parse: function( line ) {
        const tokens = this._tokenize( line );
        if ( tokens.length < 0 ) {
            return;
        }

        return this._constructCommand( tokens );
    }
} );

module.exports = LineParser;
