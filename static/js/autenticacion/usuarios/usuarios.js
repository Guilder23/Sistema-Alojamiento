/* ===========================
   USUARIOS - JAVASCRIPT PRINCIPAL
   =========================== */

class UsuariosManager {
    constructor() {
        this.usuariosContainer = document.getElementById('usuarios-tbody');
        this.paginationContainer = document.getElementById('pagination');
        this.searchInput = document.getElementById('search-usuarios');
        this.filterRol = document.getElementById('filter-rol');
        this.filterEstado = document.getElementById('filter-estado');
        this.btnCrear = document.getElementById('btn-crear-usuario');
        
        this.usuarios = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredUsuarios = [];
        
        this.init();
    }

    init() {
        this.cargarUsuarios();
        this.attachEventListeners();
        this.attachModalListeners();
    }

    attachEventListeners() {
        // Búsqueda y filtros
        this.searchInput.addEventListener('keyup', () => this.filtrar());
        this.filterRol.addEventListener('change', () => this.filtrar());
        this.filterEstado.addEventListener('change', () => this.filtrar());
        
        // Botón crear usuario
        this.btnCrear.addEventListener('click', () => this.abrirModalCrear());
    }

    attachModalListeners() {
        // Cerrar modals al hacer click en btn-close
        document.querySelectorAll('.btn-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.modalId;
                this.cerrarModal(modalId);
            });
        });

        // Cerrar modals al hacer click en botón cancelar
        document.querySelectorAll('.modal-footer .btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.modalId;
                this.cerrarModal(modalId);
            });
        });

        // Cerrar modal haciendo click fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.cerrarModal(modal.id);
                }
            });
        });
    }

    async cargarUsuarios() {
        try {
            // Simulación de datos - En producción usar API real
            this.usuarios = [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@hotel.com',
                    rol: 'administrador',
                    estado: 'activo',
                    fecha_registro: '2026-01-15',
                    nombre_completo: 'Administrador del Sistema'
                },
                {
                    id: 2,
                    username: 'recepcionista',
                    email: 'recepcionista@hotel.com',
                    rol: 'recepcionista',
                    estado: 'activo',
                    fecha_registro: '2026-01-15',
                    nombre_completo: 'Juan García'
                },
                {
                    id: 3,
                    username: 'empleado',
                    email: 'empleado@hotel.com',
                    rol: 'recepcionista',
                    estado: 'activo',
                    fecha_registro: '2026-02-01',
                    nombre_completo: 'María López'
                },
                {
                    id: 4,
                    username: 'gerente',
                    email: 'gerente@hotel.com',
                    rol: 'gerente',
                    estado: 'activo',
                    fecha_registro: '2026-01-10',
                    nombre_completo: 'Carlos Martínez'
                },
                {
                    id: 5,
                    username: 'limpieza1',
                    email: 'limpieza@hotel.com',
                    rol: 'empleado_limpieza',
                    estado: 'inactivo',
                    fecha_registro: '2025-12-20',
                    nombre_completo: 'Pedro Rodríguez'
                },
            ];
            
            this.filtrados = [...this.usuarios];
            this.renderizarTabla();
            this.renderizarPaginacion();
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            this.mostrarError('Error al cargar los usuarios');
        }
    }

    filtrar() {
        const busqueda = this.searchInput.value.toLowerCase();
        const rol = this.filterRol.value;
        const estado = this.filterEstado.value;

        this.filteredUsuarios = this.usuarios.filter(usuario => {
            const coincideBusqueda = !busqueda || 
                usuario.username.toLowerCase().includes(busqueda) ||
                usuario.email.toLowerCase().includes(busqueda) ||
                usuario.nombre_completo.toLowerCase().includes(busqueda);
            
            const coincideRol = !rol || usuario.rol === rol;
            const coincideEstado = !estado || usuario.estado === estado;

            return coincideBusqueda && coincideRol && coincideEstado;
        });

        this.currentPage = 1;
        this.renderizarTabla();
        this.renderizarPaginacion();
    }

    renderizarTabla() {
        this.usuariosContainer.innerHTML = '';

        if (this.filteredUsuarios.length === 0) {
            this.usuariosContainer.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #6b7280;">
                        📭 No hay usuarios que coincidan con los filtros
                    </td>
                </tr>
            `;
            return;
        }

        const inicio = (this.currentPage - 1) * this.itemsPerPage;
        const fin = inicio + this.itemsPerPage;
        const usuariosActivos = this.filteredUsuarios.slice(inicio, fin);

        usuariosActivos.forEach(usuario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${usuario.id}</td>
                <td><strong>${usuario.username}</strong></td>
                <td>${usuario.email}</td>
                <td><span class="badge badge-${usuario.rol}">${this.formatearRol(usuario.rol)}</span></td>
                <td><span class="badge badge-${usuario.estado}">${this.formatearEstado(usuario.estado)}</span></td>
                <td>${this.formatearFecha(usuario.fecha_registro)}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn btn-view" onclick="usuariosManager.verUsuario(${usuario.id})">👁️ Ver</button>
                        <button class="btn btn-edit" onclick="usuariosManager.editarUsuario(${usuario.id})">✏️ Editar</button>
                        <button class="btn btn-delete" onclick="usuariosManager.confirmarEliminar(${usuario.id})">🗑️ Eliminar</button>
                    </div>
                </td>
            `;
            this.usuariosContainer.appendChild(row);
        });
    }

    renderizarPaginacion() {
        this.paginationContainer.innerHTML = '';

        const totalPaginas = Math.ceil(this.filteredUsuarios.length / this.itemsPerPage);

        if (totalPaginas <= 1) return;

        // Botón anterior
        const btnAnterior = document.createElement('button');
        btnAnterior.className = 'page-btn';
        btnAnterior.textContent = '← Anterior';
        btnAnterior.disabled = this.currentPage === 1;
        btnAnterior.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderizarTabla();
                this.renderizarPaginacion();
            }
        });
        this.paginationContainer.appendChild(btnAnterior);

        // Números de página
        for (let i = 1; i <= totalPaginas; i++) {
            if (i === 1 || i === totalPaginas || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                if (i > 1 && i !== 2 && this.paginationContainer.lastChild.textContent !== '...') {
                    const puntos = document.createElement('span');
                    puntos.textContent = '...';
                    puntos.style.alignSelf = 'center';
                    this.paginationContainer.appendChild(puntos);
                }

                const btnPage = document.createElement('button');
                btnPage.className = 'page-btn';
                if (i === this.currentPage) btnPage.classList.add('active');
                btnPage.textContent = i;
                btnPage.addEventListener('click', () => {
                    this.currentPage = i;
                    this.renderizarTabla();
                    this.renderizarPaginacion();
                });
                this.paginationContainer.appendChild(btnPage);
            }
        }

        // Botón siguiente
        const btnSiguiente = document.createElement('button');
        btnSiguiente.className = 'page-btn';
        btnSiguiente.textContent = 'Siguiente →';
        btnSiguiente.disabled = this.currentPage === totalPaginas;
        btnSiguiente.addEventListener('click', () => {
            if (this.currentPage < totalPaginas) {
                this.currentPage++;
                this.renderizarTabla();
                this.renderizarPaginacion();
            }
        });
        this.paginationContainer.appendChild(btnSiguiente);
    }

    abrirModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }

    abrirModalCrear() {
        this.abrirModal('modal-crear-usuario');
    }

    verUsuario(id) {
        const usuario = this.usuarios.find(u => u.id === id);
        if (usuario) {
            const content = `
                <div class="user-details">
                    <div class="detail-item">
                        <span class="detail-label">ID</span>
                        <span class="detail-value">#${usuario.id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Usuario</span>
                        <span class="detail-value">${usuario.username}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Nombre Completo</span>
                        <span class="detail-value">${usuario.nombre_completo}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Email</span>
                        <span class="detail-value"><a href="mailto:${usuario.email}">${usuario.email}</a></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Rol</span>
                        <span class="detail-value"><span class="badge badge-${usuario.rol}">${this.formatearRol(usuario.rol)}</span></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Estado</span>
                        <span class="detail-value"><span class="badge badge-${usuario.estado}">${this.formatearEstado(usuario.estado)}</span></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Fecha Registro</span>
                        <span class="detail-value">${this.formatearFecha(usuario.fecha_registro)}</span>
                    </div>
                </div>
            `;
            document.getElementById('ver-usuario-content').innerHTML = content;
            this.abrirModal('modal-ver-usuario');
        }
    }

    editarUsuario(id) {
        const usuario = this.usuarios.find(u => u.id === id);
        if (usuario) {
            document.getElementById('edit-username').value = usuario.username;
            document.getElementById('edit-email').value = usuario.email;
            document.getElementById('edit-rol').value = usuario.rol;
            document.getElementById('edit-cambiar-password').checked = false;
            this._usuarioEditando = usuario;
            this.abrirModal('modal-editar-usuario');
        }
    }

    confirmarEliminar(id) {
        const usuario = this.usuarios.find(u => u.id === id);
        if (usuario) {
            document.getElementById('usuario-eliminar').textContent = usuario.username;
            this._usuarioEliminando = usuario;
            this.abrirModal('modal-eliminar-usuario');
        }
    }

    guardarUsuario(usuario) {
        const index = this.usuarios.findIndex(u => u.id === usuario.id);
        if (index !== -1) {
            this.usuarios[index] = usuario;
            this.filtrar();
            this.mostrarExito('Usuario actualizado exitosamente');
        }
    }

    eliminarUsuario(id) {
        this.usuarios = this.usuarios.filter(u => u.id !== id);
        this.filtrar();
        this.cerrarModal('modal-eliminar-usuario');
        this.mostrarExito('Usuario eliminado exitosamente');
    }

    // Utilidades
    formatearRol(rol) {
        const roles = {
            'administrador': 'Administrador',
            'recepcionista': 'Recepcionista',
            'gerente': 'Gerente',
            'empleado_limpieza': 'Empleado de Limpieza',
            'cliente': 'Cliente'
        };
        return roles[rol] || rol;
    }

    formatearEstado(estado) {
        return estado === 'activo' ? '✅ Activo' : '❌ Inactivo';
    }

    formatearFecha(fecha) {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    mostrarExito(mensaje) {
        console.log('✅', mensaje);
        // Aquí se puede integrar un sistema de notificaciones
    }

    mostrarError(mensaje) {
        console.error('❌', mensaje);
        // Aquí se puede integrar un sistema de notificaciones
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.usuariosManager = new UsuariosManager();
});
