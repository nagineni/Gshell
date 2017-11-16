var fs = require( "fs" ),
    path = require( "path" ),
    spawn = require( "child_process" ).spawn,
    constants = require( "./Constants" ),
    stream = require( "stream" ),
    settings = require( "./Constants" ).Settings,
    Table = require( "table-layout" ),
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

    _findBinPath: function( command ) {
        var binPath = this._paths.find( binPath => {
            var cmdPath = path.join( binPath, command );
            return fs.existsSync( cmdPath );
        } );

        if ( binPath ) {
            return path.join( binPath, command );
        }

        return null;
    },

    _gshellRunCommand: function( binCmd, command ) {
        return new Promise( ( resolve, reject ) => {
            var options = {
                env: settings.env,
                stdio: [ "pipe", "pipe", "pipe" ]
            };

            var child = spawn( binCmd, command.args, options );
            var echoStream = new stream.Writable();
            echoStream._write = ( chunk, encoding, done ) => {
                this._gshell.sendToSerial( chunk.toString() );
                this._gshell.sendToSerial( "\r" );
                done();
            };

            child.stdout.pipe( echoStream );

            var error = "";
            child.stderr.on( "data", ( data ) => {
                error += data.toString();
            } );

            child.on( "exit", code => {
                command.exitCode = code;
                if ( code === 0 ) {
                    resolve();
                } else {
                    var msg = error || "exit code " + code;
                    reject( new Error( "Failed to run the command " + msg ) );
                }
            } );

            child.on( "error", err => {
                reject( new Error( "Failed to run the command " + err ) );
            } );
        } );
    },

    _setCd: function( val ) {
        this._cd = path.normalize( val );
        process.chdir( this._cd );
    },

    _gshellCdCommand: function( command ) {
        return new Promise( ( resolve, reject ) => {
            let dirPath = command.args.length ? command.args[ 0 ] : settings.env.HOME;

            let cdPath = "";
            if ( dirPath.charAt( 0 ) === "/" ) {
                cdPath = path.normalize( dirPath );
            } else {
                cdPath = path.join( this._cd, dirPath );
            }

            var exists = fs.existsSync( cdPath );
            if ( exists ) {
                this._setCd( cdPath );
                return resolve();
            }

            reject( new Error( "No such directory found " ) );
        } );
    },

    _printPrompt: function( command ) {
        return new Promise( ( resolve, reject ) => {
            console.log( settings.prompt );
            resolve();
        } );
    },

    _setEchoMode: function( command ) {
        return new Promise( ( resolve, reject ) => {
            var mode = command.args[ 0 ];
            if ( mode === "on" ) {
                this._echo_mode = true;
                this._gshell.sendToSerial( "echo_on" );
            } else if ( mode === "off" ) {
                this._gshell.sendToSerial( "echo_off" );
                this._echo_mode = false;
            }
            command.exitPrompt = false;
            resolve();
        } );
    },

    getEchoMode: function() {
        return this._echo_mode;
    },

    _formatRow: function( row ) {
        var output = [];

        for ( const key in row ) {
            if ( key !== "cb" && key !== "skip" ) {
                output[ key ] = row[ key ];
            }
        }

        return output;
    },

    _gshellHelp: function() {
        return new Promise( ( resolve, reject ) => {
            const defaultPadding = { left: "  ", right: " " };

            var commands = constants.Commands.filter( row =>  {
                return !row.skip;
            } );

            const table = new Table( commands.map( row => this._formatRow( row ) ), {
                padding: defaultPadding
            } );

            this._gshell.sendToSerial( table.toString() );
            this._gshell.sendToSerial( "\r\n" );
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
            } else if ( command.name === "echo" ) {
                commandPromise = this._setEchoMode( command );
            } else if ( command.name === "cd" ) {
                commandPromise = this._gshellCdCommand( command );
            } else if ( command.name === "help" ) {
                commandPromise = this._gshellHelp();
            } else {
                const shellCmd = this._findBinPath( command.name );
                if ( shellCmd ) {
                    commandPromise = this._gshellRunCommand( shellCmd, command );
                }
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
