var Gshell = require( "./lib/Gshell" ),
    argv = require( "optimist" ).argv;

if ( argv.h || argv.help ) {
    console.log( [
        "usage: index.js --serial <port>",
        "",
        "options:",
        "  -v           Verbose",
        "  -h --help    Print this list and exit.",
        "  --serial  Serial port, ex. /dev/ttyGS0 "
    ].join( "\n" ) );

    process.exit();
}

var portName = argv.serial;
var verbose = argv.v;

if ( !portName ) {
    portName = "/dev/ttyGS0";
    if ( verbose ) {
        console.log( " Port not specified. Using default serial port " + portName );
    }

    var gshell = Gshell(verbose);
    gshell.connect( portName, verbose ).then( () => {
        if ( verbose ) {
            console.log( "Port successfully opened." );
        }
    } );
}

process.on( "SIGINT", function() {
    console.log( "Process stopped." );
    process.exit();
} );

process.on( "SIGTERM", function() {
    console.log( "Exit." );
    process.exit();
} );

