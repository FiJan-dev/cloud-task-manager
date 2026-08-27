Vagrant.configure("2") do |config|
    config.vm.box = "ubuntu/jammy64"

    # =======================
    # Frontend
    # =======================

    config.vm.define "frontend" do |frontend|

        frontend.vm.hostname = "frontend"

        frontend.vm.network "private_network",
            ip: "10.0.1.10",
            virtualbox__intnet: "intnet1"
        
            frontend.vm.network "forwarded_port", guest: 80, host: 8080
        frontend.vm.network "forwarded_port", guest: 443, host: 8443
        
        frontend.vm.synced_folder "./frontend", "/opt/frontend", create: true

        frontend.vm.provider "virtualbox" do |vb|
            vb.name = "proj-frontend"
            vb.memory = 2048
            vb.cpus = 2
        end

        frontend.vm.provision "shell",
            path: "provisioning/frontend.sh"
    end


    # =======================
    # Backend
    # =======================

    config.vm.define "backend" do |backend|

        backend.vm.hostname = "backend"

        backend.vm.network "private_network",
            ip: "10.0.1.20",
            virtualbox__intnet: "intnet1"
        
        backend.vm.synced_folder "./backend", "/opt/backend", create: true

        backend.vm.provider "virtualbox" do |vb|
            vb.name = "proj-backend"
            vb.memory = 2048
            vb.cpus = 2
        end 

        backend.vm.provision "shell",
            path: "provisioning/backend.sh"
    end


    # =======================
    # Banco
    # =======================

    config.vm.define "db" do |db|

        db.vm.hostname = "db"

        db.vm.network "private_network",
        ip: "10.0.1.30",
        virtualbox__intnet: "intnet1"

        db.vm.synced_folder "./db", "/opt/db", create: true

        db.vm.provider "virtualbox" do |vb|
        vb.name = "proj-db"
        vb.memory = 2048
        vb.cpus = 2
        end

        db.vm.provision "shell",
        path: "provisioning/db.sh"
    end
end
