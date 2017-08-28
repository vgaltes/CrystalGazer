"use strict"

const nodegit = require('nodegit');

function getFileOn(file, repository, commit){
    // Clone a given repository into the `./tmp` folder.
    return nodegit.Repository.open(repository)
    // Look up this known commit.
    .then(function(repo) {
        // Use a known commit sha from this repository.
        return repo.getCommit(commit);
    })
    // Look up a specific file within that commit.
    .then(function(commit) {
        return commit.getEntry(file);
    })
    // Get the blob contents from the file.
    .then(function(entry) {
        // Patch the blob to contain a reference to the entry.
        return entry.getBlob().then(function(blob) {
            blob.entry = entry;
            return blob;
        });
    })
    // Display information about the blob.
    .then(function(blob) {
        return String(blob);
    })
    .catch(function(err) { 
        console.log(err); 
    });
}

module.exports = {
    getFileOnCommit: function(file, repository, commit){
        return getFileOn(file, repository, commit);
    }
}