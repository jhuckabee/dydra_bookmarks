# Dydra Bookmarks

Save your bookmarks in the cloud using Dydra's cloud hosted RDF data store.

This project consists of two pieces.  The first is a script which will convert
your existing delicious bookmarks to and RDF data file. You can use this file
to import your bookmarks into one of your repositories on Dydra.

The second piece of this project is a Google Chrome extension which allows you
to add bookmarks to your Dydra repository from your browser.

## Importing your bookmarks from Delicious

What you will need:

* You downloaded bookmarks from delicious
* The delicious_to_nt.rb script provided in this project
* A working ruby interpreter installed
* The following gems: nokogiri, rdf, dydra


You can download your bookmarks from here:

    https://secure.delicious.com/settings/bookmarks/export

To run the script simply run the ruby file and provide it the name of your downloaded
bookmarks file

    ruby delicious_to_nt.rb delicious-2011032902.htm

This will create a file called `bookmarks.nt`

To import these bookmarks into dydra, issue the following Dydra command.

    dydra import [your_repository] bookmarks.nt

## Keeping your bookmarks up to date

The included chrome extension is currently in a very early beta stage. It will allow
you to bookmark new sites, but it currently doesn't suppport removing bookmarks,
editing existing bookmarks, or syncing. These features are all in the works.

Additionally, you won't find this extension published in the Chrome extensions gallery...
yet. Until we've completed the basic functionality of removing and deleting existing
bookmarks, we will require you to install the extension manually.

To install the extension you will need to download the code, visit your extensions 
manager page, click on the "Developer mode" link in the upper left, and then click
on "Load unpacked extension".  Browse to the location of the "chrome_extension"
directory, and then click "open".  The extension should now be installed.
