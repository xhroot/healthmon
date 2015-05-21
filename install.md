
# Installation/setup notes

This app needs the $GOGAE env var to be defined and set to the go appengine directory:

    export GOGAE=/home/$USER/google/go_appengine

Add `goapp` to your execution path:

    export PATH=$GOGAE:%PATH

Be alert in using `goapp` instead of `go` for GAE golang projects.

Use `srv.sh` to run the dev server. If it is not accessible externally, use `netstat -an`:

       TCP    0.0.0.0:8080           0.0.0.0:0              LISTEN

If IP is 0.0.0.0 it means it listens on all IP addresses which is correct.  Check firewall port rules.

Use `deploy.sh` to push to appengine.  External dependencies like github may need to be symlinked from this root.

    $ ln -s $GOGAE/gopath/src/github.com/gorilla github.com/gorilla

