var _ = require( "lodash" ),
    parser = require( "./LineParser" ),
    settings = require( "./Constants" ).Settings,
    serialport = require( "serialport" );

var Gshell = function( verbose ) {
    if ( !this._isGshell ) {
        return new Gshell( verbose );
    }

    this._parser = parser( this );
    this._verbose = verbose;
};

_.extend( Gshell.prototype, {
    _isGshell: true,
    _lineCallbacks: [],
    _myPort: null,
    _keypressCallbacks: [],
    _portClosed: true,
    _portOpening: false,
    _portFound: false,
    _portName: null,

    verbose: function() {
        return this._verbose ? true : false;
    },

    _parseData: function( line ) {
        const parsedLine = this._parser.parse( line );
        console.log(parsedLine);
        this.sendToSerial( line );
    },

    _showPortOpen: function() {
        this._portClosed = false;
        console.log( settings.prompt );
    },

    _showPortClose: function() {
        this._portClosed = true;
        if ( this._verbose ) {
            console.log( "Port closed." );
        }

        this._portOpening = false;
        setTimeout( () => {
            if ( this._verbose ) {
                console.log( "Retry openning port.", this._portName );
            }
            this.connect( this._portName );
        }, 5000 );
    },

    _showError: function( error ) {
        if ( this._verbose ) {
            console.log( "Serial port error: ", error );
        }
        this._portOpening = false;

        setTimeout( () => {
            if ( this._verbose ) {
                console.log( "Retry openning port.", this._portName );
            }
            this.connect( this._portName );
        }, 5000 );
    },

    sendToSerial: function( data ) {
        return new Promise( ( resolve, reject ) => {
            if ( this._portClosed ) {
                reject( new Error( "No serial port opened" ) );
            }

            if ( this._verbose ) {
                console.log( "sending to serial: [" + data + "]\n" );
            }

            this._myPort.write( data );
            resolve();
        } );
    },

    // List serial ports to validate the current port:
    _validatePort: function( success ) {
        serialport.list( function( err, ports ) {
            ports.forEach( function( port ) {

                if ( port.comName === this._portName ) {
                    if ( this._verbose ) {
                        console.log( " Serial Port found " + this._portName );
                    }
                    this._portFound = true;
                }
            }.bind( this ) );

            success();
        }.bind( this ) );
    },

    connect: function( portName ) {
        return new Promise( ( resolve, reject ) => {
            if ( this._portOpening === true ) {
                reject();
            }

            this._portName = portName;
            this._portOpening = true;
            this._validatePort( function() {

                if ( !this._portFound && this._verbose ) {
                    console.log( "Serial Port not found. Try opening the given port: ", this._portName );
                }

                this._myPort = new serialport( portName, {
                    baudRate: 57600,
                    parity: "none",
                    dataBits: 8,
                    stopBits: 1
                } );

                // Use a `\n` as a line terminator
                const rlparser = new serialport.parsers.Readline( {
                    delimiter: "\n"
                } );

                this._myPort.pipe( rlparser );
                this._myPort.on( "open", () => {
                    this._showPortOpen();
                    resolve();
                } );

                this._myPort.on( "error", ( error ) =>  {
                    this._showError( error );
                } );

                this._myPort.on( "close", () => this._showPortClose() );
                rlparser.on( "data", ( data ) => this._parseData( data ) );

            }.bind( this ) );
        } );
    }
} );

module.exports = Gshell;
