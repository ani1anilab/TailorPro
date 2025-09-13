// Team management module - Updated with new layout and functionality
const Team = {
    currentTeam: [],

    init() {
        this.loadTeam();
        this.bindEvents();
        this.ensureDefaultOwner();
    },

    ensureDefaultOwner() {
        const data = Storage.getAllData();
        if (!data.teamMembers || data.teamMembers.length === 0) {
            const defaultOwner = {
                id: Date.now(),
                name: 'Owner',
                role: 'Owner/Administrator',
                phone: '',
                email: '',
                createdAt: new Date().toISOString(),
                isDefault: true
            };
            
            if (!data.teamMembers) data.teamMembers = [];
            data.teamMembers.push(defaultOwner);
            Storage.saveAllData(data);
            this.loadTeam();
        }
    },

    bindEvents() {
        // Team section events
        document.getElementById('addTeamMemberBtn')?.addEventListener('click', () => this.showTeamMemberModal());
        document.getElementById('teamMemberForm')?.addEventListener('submit', (e) => this.handleTeamMemberSubmit(e));
        document.getElementById('cancelTeamMember')?.addEventListener('click', () => this.hideTeamMemberModal());
        
        // Modal close
        const closeBtn = document.querySelector('#teamMemberModal .close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideTeamMemberModal());
        }
    },

    loadTeam() {
        const data = Storage.getAllData();
        this.currentTeam = data.teamMembers || [];
        this.renderTeamMembers();
        this.updateOrderTeamSelects();
    },

    renderTeamMembers() {
        const container = document.getElementById('teamMembersList');
        if (!container) return;

        if (this.currentTeam.length === 0) {
            container.innerHTML = `
                <div class="team-empty-state">
                    <i class="fas fa-users-cog"></i>
                    <h4>No Team Members Yet</h4>
                    <p>Start by adding your first team member to manage and assign orders.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.currentTeam.map(member => `
            <div class="team-member-card">
                ${member.isDefault ? '<div class="team-member-default">DEFAULT</div>' : ''}
                <div class="team-member-header">
                    <div>
                        <div class="team-member-name">${member.name}</div>
                        <div class="team-member-role">${member.role}</div>
                    </div>
                </div>
                <div class="team-member-info">
                    ${member.phone ? `<p><i class="fas fa-phone"></i> ${member.phone}</p>` : ''}
                    ${member.email ? `<p><i class="fas fa-envelope"></i> ${member.email}</p>` : ''}
                    <p><i class="fas fa-calendar"></i> Joined ${Utils.formatDate(member.createdAt)}</p>
                </div>
                <div class="team-member-actions">
                    ${!member.isDefault ? `
                        <button class="btn btn-sm btn-secondary" onclick="Team.editTeamMember(${member.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="Team.deleteTeamMember(${member.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-secondary" onclick="Team.editTeamMember(${member.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    `}
                </div>
            </div>
        `).join('');
    },

    showTeamMemberModal(member = null) {
        const modal = document.getElementById('teamMemberModal');
        const form = document.getElementById('teamMemberForm');

        if (member) {
            document.getElementById('teamMemberId').value = member.id;
            document.getElementById('teamMemberName').value = member.name;
            document.getElementById('teamMemberRole').value = member.role;
            document.getElementById('teamMemberPhone').value = member.phone || '';
            document.getElementById('teamMemberEmail').value = member.email || '';
        } else {
            form.reset();
            document.getElementById('teamMemberId').value = '';
        }

        modal.style.display = 'block';
    },

    hideTeamMemberModal() {
        document.getElementById('teamMemberModal').style.display = 'none';
    },

    handleTeamMemberSubmit(e) {
        e.preventDefault();

        const memberData = {
            name: document.getElementById('teamMemberName').value,
            role: document.getElementById('teamMemberRole').value,
            phone: document.getElementById('teamMemberPhone').value,
            email: document.getElementById('teamMemberEmail').value
        };

        const memberId = document.getElementById('teamMemberId').value;

        if (memberId) {
            this.updateTeamMember(parseInt(memberId), memberData);
        } else {
            this.addTeamMember(memberData);
        }

        this.hideTeamMemberModal();
    },

    addTeamMember(memberData) {
        const data = Storage.getAllData();
        if (!data.teamMembers) data.teamMembers = [];
        
        memberData.id = Date.now();
        memberData.createdAt = new Date().toISOString();
        data.teamMembers.push(memberData);
        
        Storage.saveAllData(data);
        this.loadTeam();
    },

    updateTeamMember(id, updates) {
        const data = Storage.getAllData();
        const index = data.teamMembers.findIndex(m => m.id === id);
        
        if (index !== -1) {
            data.teamMembers[index] = { ...data.teamMembers[index], ...updates };
            Storage.saveAllData(data);
            this.loadTeam();
        }
    },

    editTeamMember(id) {
        const member = this.currentTeam.find(m => m.id === id);
        if (member) {
            this.showTeamMemberModal(member);
        }
    },

    deleteTeamMember(id) {
        const member = this.currentTeam.find(m => m.id === id);
        if (!member) return;
        
        CustomPopup.show({
            icon: 'fas fa-trash',
            title: 'Delete Team Member',
            message: `Are you sure you want to delete "${member.name}"? This will not affect existing orders.`,
            confirmText: 'Delete',
            confirmClass: 'btn-danger',
            onConfirm: () => {
                const data = Storage.getAllData();
                data.teamMembers = data.teamMembers.filter(m => m.id !== id);
                Storage.saveAllData(data);
                this.loadTeam();
            }
        });
    },

    updateOrderTeamSelects() {
        // Update team member selects in order modal
        const teamSelect = document.getElementById('orderTeamMember');
        if (teamSelect) {
            const currentValue = teamSelect.value;
            teamSelect.innerHTML = '<option value="">Select Team Member</option>';
            
            this.currentTeam.forEach(member => {
                const option = document.createElement('option');
                option.value = member.id;
                option.textContent = `${member.name} (${member.role})`;
                teamSelect.appendChild(option);
            });
            
            teamSelect.value = currentValue;
        }
    },

    getTeamMemberById(id) {
        return this.currentTeam.find(m => m.id === id);
    }
};