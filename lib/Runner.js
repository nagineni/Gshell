var fs = require( "fs" ),
    constants = require( "./Constants" ),
    settings = require( "./Constants" ).Settings,
    _ = require( "lodash" );

var Runner = function( gshell ) {
    if ( !this._isRunner ) {
        return new Runner( gshell );
    }

    this._gshell = gshell;
    this._path = settings.env.PATH;
    this._paths = this._path.split( ":" );
    this._cd = settings.env.HOME;

    this._setCd( this._cd );
};

_.extend( Runner.prototype, {
    _isRunner: true,
    _transferState: false,
    _writeStream: null,
    _asciiEndOfTrans: "\x1A",
    _echo_mode: true,

    _setCd: function( val ) {
        this._cd = path.normalize( val );
        process.chdir( this._cd );
    },

    _printPrompt: function( command ) {
        return new Promise( ( resolve, reject ) => {
            console.log( settings.prompt );
            resolve();
        } );
    },

    _parseCommand: function( command ) {
        return new Promise( ( resolve, reject ) => {
            let commandPromise;
            let cmdFound = false;

            constants.Commands.filter( gcmd => {
                if ( gcmd.name === command.name ) {
                    cmdFound = true;
                }
            } );

            if ( !cmdFound ) {
                return reject( new Error( "Command not found. Type 'help' for available commands." ) );
            }

            if ( command.name === "init" ) {
                commandPromise = this._printPrompt( command );
            }
             
            if ( !commandPromise ) {
                return reject( new Error( "No system command to execute." + command.name ) );
            }

            commandPromise.then( () => {
                resolve();
            }, reject );
        } );
    },

    execute: function( command ) {

        return new Promise( ( resolve, reject ) => {
            if ( !command ) {
                return reject( new Error( "Command not found. Type 'help' for available commands." ) );
            }

            this._parseCommand( command )
                .then( () => {
                    resolve( command );
                } )
                .catch( err => {
                    reject( err );
                } );
        } );
    }
} );

module.exports = Runner;
